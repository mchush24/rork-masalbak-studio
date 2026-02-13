import type { TaskType } from '@/types/analysis';

/**
 * Human-readable Turkish labels for each TaskType.
 * Single source of truth — used by history, dashboard, and other screens.
 */
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  DAP: 'İnsan Çizimi',
  HTP: 'Ev-Ağaç-İnsan',
  Family: 'Aile Çizimi',
  Aile: 'Aile Çizimi',
  Cactus: 'Kaktüs Testi',
  Kaktus: 'Kaktüs Testi',
  Tree: 'Ağaç Testi',
  Agac: 'Ağaç Testi',
  Garden: 'Bahçe Testi',
  Bahce: 'Bahçe Testi',
  BenderGestalt2: 'Bender Gestalt',
  Bender: 'Bender Gestalt',
  ReyOsterrieth: 'Rey Figure',
  Rey: 'Rey Figure',
  Luscher: 'Lüscher Renk',
  FreeDrawing: 'Serbest Çizim',
};
