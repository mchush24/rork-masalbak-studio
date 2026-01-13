import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, type Child } from '@/lib/hooks/useAuth';

const SELECTED_CHILD_KEY = '@renkioo_selected_child';

interface ChildContextType {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
  children: Child[];
  hasChildren: boolean;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children: childrenProp }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedChild, setSelectedChildState] = useState<Child | null>(null);

  const userChildren = user?.children || [];
  const hasChildren = userChildren.length > 0;

  // Load selected child from storage on mount
  useEffect(() => {
    loadSelectedChild();
  }, []);

  // Auto-select first child if none selected and children exist
  useEffect(() => {
    if (!selectedChild && hasChildren) {
      setSelectedChild(userChildren[0]);
    }
  }, [userChildren, hasChildren]);

  const loadSelectedChild = async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_CHILD_KEY);
      if (stored) {
        const child = JSON.parse(stored) as Child;
        setSelectedChildState(child);
      }
    } catch (error) {
      console.log('[ChildContext] Error loading selected child:', error);
    }
  };

  const setSelectedChild = async (child: Child | null) => {
    setSelectedChildState(child);
    try {
      if (child) {
        await AsyncStorage.setItem(SELECTED_CHILD_KEY, JSON.stringify(child));
      } else {
        await AsyncStorage.removeItem(SELECTED_CHILD_KEY);
      }
    } catch (error) {
      console.log('[ChildContext] Error saving selected child:', error);
    }
  };

  return (
    <ChildContext.Provider
      value={{
        selectedChild,
        setSelectedChild,
        children: userChildren,
        hasChildren,
      }}
    >
      {childrenProp}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
}
