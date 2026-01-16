/**
 * CollaborationManager - Gerçek Zamanlı İşbirliği Yöneticisi
 *
 * Phase 3: Real-time Collaboration
 * - WebSocket/Supabase Realtime bağlantısı
 * - İmleç pozisyonu paylaşımı
 * - Fırça darbeleri senkronizasyonu
 * - Oda yönetimi
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

export interface CollaboratorInfo {
  id: string;
  name: string;
  avatar?: string;
  color: string; // Collaborator cursor color
  isHost: boolean;
}

export interface CursorPosition {
  collaboratorId: string;
  x: number;
  y: number;
  isDrawing: boolean;
  currentColor?: string;
  currentBrush?: string;
}

export interface StrokeData {
  id: string;
  collaboratorId: string;
  color: string;
  brushType: string;
  brushSize: number;
  points: { x: number; y: number; pressure?: number }[];
  timestamp: number;
}

export interface RoomInfo {
  id: string;
  code: string;
  hostId: string;
  templateId: string;
  templateName: string;
  createdAt: Date;
  maxCollaborators: number;
  collaborators: CollaboratorInfo[];
}

export type CollabEventType =
  | 'cursor_move'
  | 'stroke_start'
  | 'stroke_update'
  | 'stroke_end'
  | 'undo'
  | 'redo'
  | 'clear'
  | 'user_join'
  | 'user_leave'
  | 'room_close';

export interface CollabEvent {
  type: CollabEventType;
  data: unknown;
  senderId: string;
  timestamp: number;
}

// Callback types
type CursorCallback = (cursor: CursorPosition) => void;
type StrokeCallback = (stroke: StrokeData) => void;
type CollaboratorCallback = (collaborators: CollaboratorInfo[]) => void;
type EventCallback = (event: CollabEvent) => void;

// ============================================
// COLLABORATOR COLORS
// ============================================

const COLLABORATOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#A8D8EA', // Blue
];

// ============================================
// COLLABORATION MANAGER
// ============================================

class CollaborationManagerClass {
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private currentRoom: RoomInfo | null = null;
  private currentUser: CollaboratorInfo | null = null;
  private collaborators: Map<string, CollaboratorInfo> = new Map();

  // Callbacks
  private cursorCallbacks: Set<CursorCallback> = new Set();
  private strokeCallbacks: Set<StrokeCallback> = new Set();
  private collaboratorCallbacks: Set<CollaboratorCallback> = new Set();
  private eventCallbacks: Set<EventCallback> = new Set();

  // Pending strokes (for batching)
  private pendingStroke: StrokeData | null = null;
  private strokeUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize with Supabase client
   */
  initialize(supabaseUrl: string, supabaseKey: string): void {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[CollabManager] Initialized');
  }

  /**
   * Create a new collaboration room
   */
  async createRoom(
    userId: string,
    userName: string,
    templateId: string,
    templateName: string
  ): Promise<RoomInfo> {
    if (!this.supabase) {
      throw new Error('CollaborationManager not initialized');
    }

    // Generate room code
    const roomCode = this.generateRoomCode();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create host user
    this.currentUser = {
      id: userId,
      name: userName,
      color: COLLABORATOR_COLORS[0],
      isHost: true,
    };

    // Create room info
    this.currentRoom = {
      id: roomId,
      code: roomCode,
      hostId: userId,
      templateId,
      templateName,
      createdAt: new Date(),
      maxCollaborators: 4,
      collaborators: [this.currentUser],
    };

    this.collaborators.set(userId, this.currentUser);

    // Join channel
    await this.joinChannel(roomId);

    // Broadcast room creation
    this.broadcastEvent('user_join', this.currentUser);

    console.log('[CollabManager] Room created:', roomCode);
    return this.currentRoom;
  }

  /**
   * Join an existing room
   */
  async joinRoom(
    roomCode: string,
    userId: string,
    userName: string
  ): Promise<RoomInfo | null> {
    if (!this.supabase) {
      throw new Error('CollaborationManager not initialized');
    }

    // In a real implementation, you would fetch room info from the database
    // For now, we'll use the room code as the channel name
    const roomId = `room_${roomCode}`;

    // Assign a color
    const colorIndex = this.collaborators.size % COLLABORATOR_COLORS.length;

    this.currentUser = {
      id: userId,
      name: userName,
      color: COLLABORATOR_COLORS[colorIndex],
      isHost: false,
    };

    this.collaborators.set(userId, this.currentUser);

    // Join channel
    await this.joinChannel(roomId);

    // Broadcast join
    this.broadcastEvent('user_join', this.currentUser);

    console.log('[CollabManager] Joined room:', roomCode);
    return this.currentRoom;
  }

  /**
   * Join a realtime channel
   */
  private async joinChannel(roomId: string): Promise<void> {
    if (!this.supabase) return;

    // Leave existing channel if any
    if (this.channel) {
      await this.channel.unsubscribe();
    }

    // Create and subscribe to channel
    this.channel = this.supabase.channel(roomId, {
      config: {
        broadcast: { ack: true },
        presence: { key: this.currentUser?.id },
      },
    });

    // Handle presence
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel?.presenceState() || {};
      this.handlePresenceSync(state);
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      this.handlePresenceJoin(key, newPresences);
    });

    this.channel.on('presence', { event: 'leave' }, ({ key }) => {
      this.handlePresenceLeave(key);
    });

    // Handle broadcast events
    this.channel.on('broadcast', { event: 'cursor' }, (payload) => {
      this.handleCursorEvent(payload.payload);
    });

    this.channel.on('broadcast', { event: 'stroke' }, (payload) => {
      this.handleStrokeEvent(payload.payload);
    });

    this.channel.on('broadcast', { event: 'action' }, (payload) => {
      this.handleActionEvent(payload.payload);
    });

    // Subscribe
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track presence
        await this.channel?.track({
          user: this.currentUser,
          online_at: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Leave current room
   */
  async leaveRoom(): Promise<void> {
    if (this.channel) {
      // Broadcast leave
      this.broadcastEvent('user_leave', { userId: this.currentUser?.id });

      await this.channel.unsubscribe();
      this.channel = null;
    }

    this.currentRoom = null;
    this.currentUser = null;
    this.collaborators.clear();

    console.log('[CollabManager] Left room');
  }

  /**
   * Close room (host only)
   */
  async closeRoom(): Promise<void> {
    if (!this.currentUser?.isHost) {
      throw new Error('Only host can close the room');
    }

    // Broadcast room close
    this.broadcastEvent('room_close', { roomId: this.currentRoom?.id });

    await this.leaveRoom();
    console.log('[CollabManager] Room closed');
  }

  // ==========================================
  // CURSOR EVENTS
  // ==========================================

  /**
   * Send cursor position
   */
  sendCursor(x: number, y: number, isDrawing: boolean): void {
    if (!this.channel || !this.currentUser) return;

    const cursor: CursorPosition = {
      collaboratorId: this.currentUser.id,
      x,
      y,
      isDrawing,
      currentColor: this.currentUser.color,
    };

    this.channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: cursor,
    });
  }

  private handleCursorEvent(cursor: CursorPosition): void {
    // Don't process own cursor
    if (cursor.collaboratorId === this.currentUser?.id) return;

    this.cursorCallbacks.forEach(cb => cb(cursor));
  }

  // ==========================================
  // STROKE EVENTS
  // ==========================================

  /**
   * Start a new stroke
   */
  startStroke(color: string, brushType: string, brushSize: number, point: { x: number; y: number }): void {
    if (!this.currentUser) return;

    this.pendingStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      collaboratorId: this.currentUser.id,
      color,
      brushType,
      brushSize,
      points: [point],
      timestamp: Date.now(),
    };

    this.broadcastStroke('stroke_start', this.pendingStroke);
  }

  /**
   * Update current stroke with new points
   */
  updateStroke(points: { x: number; y: number }[]): void {
    if (!this.pendingStroke) return;

    this.pendingStroke.points.push(...points);

    // Batch updates
    if (this.strokeUpdateTimer) {
      clearTimeout(this.strokeUpdateTimer);
    }

    this.strokeUpdateTimer = setTimeout(() => {
      if (this.pendingStroke) {
        this.broadcastStroke('stroke_update', this.pendingStroke);
      }
    }, 16); // ~60fps
  }

  /**
   * End current stroke
   */
  endStroke(): void {
    if (!this.pendingStroke) return;

    if (this.strokeUpdateTimer) {
      clearTimeout(this.strokeUpdateTimer);
    }

    this.broadcastStroke('stroke_end', this.pendingStroke);
    this.pendingStroke = null;
  }

  private broadcastStroke(type: CollabEventType, stroke: StrokeData): void {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'stroke',
      payload: { type, stroke },
    });
  }

  private handleStrokeEvent(payload: { type: CollabEventType; stroke: StrokeData }): void {
    // Don't process own strokes
    if (payload.stroke.collaboratorId === this.currentUser?.id) return;

    this.strokeCallbacks.forEach(cb => cb(payload.stroke));
    this.eventCallbacks.forEach(cb => cb({
      type: payload.type,
      data: payload.stroke,
      senderId: payload.stroke.collaboratorId,
      timestamp: payload.stroke.timestamp,
    }));
  }

  // ==========================================
  // ACTION EVENTS
  // ==========================================

  /**
   * Broadcast undo action
   */
  sendUndo(): void {
    this.broadcastEvent('undo', { userId: this.currentUser?.id });
  }

  /**
   * Broadcast redo action
   */
  sendRedo(): void {
    this.broadcastEvent('redo', { userId: this.currentUser?.id });
  }

  /**
   * Broadcast clear action
   */
  sendClear(): void {
    this.broadcastEvent('clear', { userId: this.currentUser?.id });
  }

  private broadcastEvent(type: CollabEventType, data: unknown): void {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'action',
      payload: {
        type,
        data,
        senderId: this.currentUser?.id,
        timestamp: Date.now(),
      },
    });
  }

  private handleActionEvent(event: CollabEvent): void {
    // Don't process own events
    if (event.senderId === this.currentUser?.id) return;

    this.eventCallbacks.forEach(cb => cb(event));
  }

  // ==========================================
  // PRESENCE HANDLERS
  // ==========================================

  private handlePresenceSync(state: Record<string, unknown>): void {
    // Update collaborators from presence state
    Object.entries(state).forEach(([key, presences]) => {
      if (Array.isArray(presences) && presences.length > 0) {
        const presence = presences[0] as { user?: CollaboratorInfo };
        if (presence.user) {
          this.collaborators.set(key, presence.user);
        }
      }
    });

    this.notifyCollaboratorChange();
  }

  private handlePresenceJoin(key: string, presences: unknown[]): void {
    if (presences.length > 0) {
      const presence = presences[0] as { user?: CollaboratorInfo };
      if (presence.user) {
        this.collaborators.set(key, presence.user);
        this.notifyCollaboratorChange();
      }
    }
  }

  private handlePresenceLeave(key: string): void {
    this.collaborators.delete(key);
    this.notifyCollaboratorChange();
  }

  private notifyCollaboratorChange(): void {
    const collabArray = Array.from(this.collaborators.values());
    this.collaboratorCallbacks.forEach(cb => cb(collabArray));
  }

  // ==========================================
  // SUBSCRIPTIONS
  // ==========================================

  onCursorMove(callback: CursorCallback): () => void {
    this.cursorCallbacks.add(callback);
    return () => this.cursorCallbacks.delete(callback);
  }

  onStroke(callback: StrokeCallback): () => void {
    this.strokeCallbacks.add(callback);
    return () => this.strokeCallbacks.delete(callback);
  }

  onCollaboratorsChange(callback: CollaboratorCallback): () => void {
    this.collaboratorCallbacks.add(callback);
    return () => this.collaboratorCallbacks.delete(callback);
  }

  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => this.eventCallbacks.delete(callback);
  }

  // ==========================================
  // GETTERS
  // ==========================================

  getRoom(): RoomInfo | null {
    return this.currentRoom;
  }

  getCurrentUser(): CollaboratorInfo | null {
    return this.currentUser;
  }

  getCollaborators(): CollaboratorInfo[] {
    return Array.from(this.collaborators.values());
  }

  isHost(): boolean {
    return this.currentUser?.isHost ?? false;
  }

  isConnected(): boolean {
    return this.channel !== null;
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

// Export singleton
export const CollaborationManager = new CollaborationManagerClass();
export default CollaborationManager;
