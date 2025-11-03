/**
 * Zustand store for user-specific table preferences
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TablePreferences } from '../types/table.types';
import { STORAGE_KEYS } from '../utils/constants';

interface UserPreferencesState {
  // Preferences keyed by tableId_userId
  preferences: Map<string, TablePreferences>;
}

interface UserPreferencesStore extends UserPreferencesState {
  // Get preferences for a table
  getPreferences: (tableId: string, userId: string) => TablePreferences | null;

  // Set preferences for a table
  setPreferences: (tableId: string, userId: string, preferences: TablePreferences) => void;

  // Update specific preference fields
  updateColumnVisibility: (
    tableId: string,
    userId: string,
    visibility: Record<string, boolean>
  ) => void;
  updateColumnWidths: (tableId: string, userId: string, widths: Record<string, number>) => void;
  updateColumnOrder: (tableId: string, userId: string, order: string[]) => void;

  // Clear preferences
  clearPreferences: (tableId: string, userId: string) => void;
  clearAllPreferences: () => void;
}

const getPreferenceKey = (tableId: string, userId: string): string => {
  return `${tableId}_${userId}`;
};

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: new Map(),

      getPreferences: (tableId, userId) => {
        const key = getPreferenceKey(tableId, userId);
        return get().preferences.get(key) || null;
      },

      setPreferences: (tableId, userId, preferences) =>
        set((state) => {
          const key = getPreferenceKey(tableId, userId);
          const newPreferences = new Map(state.preferences);
          newPreferences.set(key, preferences);
          return { preferences: newPreferences };
        }),

      updateColumnVisibility: (tableId, userId, visibility) =>
        set((state) => {
          const key = getPreferenceKey(tableId, userId);
          const existing = state.preferences.get(key) || {
            tableId,
            userId,
          };

          const newPreferences = new Map(state.preferences);
          newPreferences.set(key, {
            ...existing,
            columnVisibility: visibility,
          });

          return { preferences: newPreferences };
        }),

      updateColumnWidths: (tableId, userId, widths) =>
        set((state) => {
          const key = getPreferenceKey(tableId, userId);
          const existing = state.preferences.get(key) || {
            tableId,
            userId,
          };

          const newPreferences = new Map(state.preferences);
          newPreferences.set(key, {
            ...existing,
            columnWidths: widths,
          });

          return { preferences: newPreferences };
        }),

      updateColumnOrder: (tableId, userId, order) =>
        set((state) => {
          const key = getPreferenceKey(tableId, userId);
          const existing = state.preferences.get(key) || {
            tableId,
            userId,
          };

          const newPreferences = new Map(state.preferences);
          newPreferences.set(key, {
            ...existing,
            columnOrder: order,
          });

          return { preferences: newPreferences };
        }),

      clearPreferences: (tableId, userId) =>
        set((state) => {
          const key = getPreferenceKey(tableId, userId);
          const newPreferences = new Map(state.preferences);
          newPreferences.delete(key);
          return { preferences: newPreferences };
        }),

      clearAllPreferences: () => set({ preferences: new Map() }),
    }),
    {
      name: STORAGE_KEYS.TABLE_PREFERENCES,
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Map
      partialize: (state) => ({
        preferences: Array.from(state.preferences.entries()),
      }),
      // Custom deserialization for Map
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { preferences: Array<[string, TablePreferences]> };
        return {
          ...currentState,
          preferences: new Map(persisted.preferences || []),
        };
      },
    }
  )
);
