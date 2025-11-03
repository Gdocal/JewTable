/**
 * LocalStorage Adapter for Table Settings
 * Enhancement 1: Configurable Settings Persistence
 *
 * Default storage adapter that uses browser localStorage
 */

import { TableSettings, TableSettingsStorage } from '../types/settings.types';

export class LocalStorageAdapter implements TableSettingsStorage {
  private getKey(tableId: string, userId: string | undefined): string {
    // Include userId in key if provided (for multi-user local testing)
    return userId ? `table-settings-${tableId}-${userId}` : `table-settings-${tableId}`;
  }

  save(tableId: string, userId: string | undefined, settings: TableSettings): void {
    try {
      const key = this.getKey(tableId, userId);
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save table settings to localStorage:', error);
    }
  }

  load(tableId: string, userId: string | undefined): TableSettings | null {
    try {
      const key = this.getKey(tableId, userId);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load table settings from localStorage:', error);
    }
    return null;
  }

  clear(tableId: string, userId: string | undefined): void {
    try {
      const key = this.getKey(tableId, userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear table settings from localStorage:', error);
    }
  }
}

/**
 * Default instance for convenience
 */
export const localStorageAdapter = new LocalStorageAdapter();
