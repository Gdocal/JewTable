/**
 * Server Storage Adapter for Table Settings
 * Enhancement 1: Configurable Settings Persistence
 *
 * Example adapter that saves settings to a server API
 * Developers should customize this to match their API endpoints
 */

import { TableSettings, TableSettingsStorage } from '../types/settings.types';

export interface ServerStorageConfig {
  apiBaseUrl: string;
  authToken?: string;
  headers?: Record<string, string>;
}

export class ServerStorageAdapter implements TableSettingsStorage {
  private config: ServerStorageConfig;

  constructor(config: ServerStorageConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  async save(tableId: string, userId: string | undefined, settings: TableSettings): Promise<void> {
    if (!userId) {
      console.warn('ServerStorageAdapter requires userId');
      return;
    }

    try {
      const url = `${this.config.apiBaseUrl}/users/${userId}/table-settings/${tableId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save table settings to server:', error);
      throw error;
    }
  }

  async load(tableId: string, userId: string | undefined): Promise<TableSettings | null> {
    if (!userId) {
      console.warn('ServerStorageAdapter requires userId');
      return null;
    }

    try {
      const url = `${this.config.apiBaseUrl}/users/${userId}/table-settings/${tableId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        // No settings found - not an error
        return null;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const settings = await response.json();
      return settings;
    } catch (error) {
      console.error('Failed to load table settings from server:', error);
      // Return null instead of throwing - allows table to work with default settings
      return null;
    }
  }

  async clear(tableId: string, userId: string | undefined): Promise<void> {
    if (!userId) {
      console.warn('ServerStorageAdapter requires userId');
      return;
    }

    try {
      const url = `${this.config.apiBaseUrl}/users/${userId}/table-settings/${tableId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to clear table settings on server:', error);
      throw error;
    }
  }
}

/**
 * Example usage:
 *
 * const serverStorage = new ServerStorageAdapter({
 *   apiBaseUrl: 'https://api.example.com',
 *   authToken: 'user-auth-token',
 * });
 *
 * <DataTable
 *   settingsStorage={serverStorage}
 *   userId="user123"
 *   ...
 * />
 */
