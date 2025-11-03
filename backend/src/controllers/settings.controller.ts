/**
 * User Settings Controller
 * Handles user preferences and table settings persistence
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest, TableSettings } from '../types';

export class SettingsController {
  /**
   * GET /api/users/me/settings/:tableId
   * Get user's table settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { tableId } = req.params;
      const userId = req.user!.userId;

      const settings = await prisma.tableSettings.findUnique({
        where: {
          userId_tableId: {
            userId,
            tableId,
          },
        },
      });

      if (!settings) {
        return res.json({
          success: true,
          data: null,
        });
      }

      res.json({
        success: true,
        data: settings.settings as TableSettings,
      });
    } catch (error) {
      console.error('getSettings error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch settings' } });
    }
  }

  /**
   * PUT /api/users/me/settings/:tableId
   * Save or update user's table settings
   */
  static async saveSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { tableId } = req.params;
      const userId = req.user!.userId;
      const organizationId = req.user!.organizationId;
      const settings: TableSettings = req.body;

      const data = await prisma.tableSettings.upsert({
        where: {
          userId_tableId: {
            userId,
            tableId,
          },
        },
        create: {
          userId,
          organizationId,
          tableId,
          settings: settings as any,
        },
        update: {
          settings: settings as any,
        },
      });

      res.json({
        success: true,
        data: data.settings as TableSettings,
      });
    } catch (error) {
      console.error('saveSettings error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to save settings' } });
    }
  }

  /**
   * DELETE /api/users/me/settings/:tableId
   * Reset user's table settings to defaults
   */
  static async deleteSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { tableId } = req.params;
      const userId = req.user!.userId;

      await prisma.tableSettings.delete({
        where: {
          userId_tableId: {
            userId,
            tableId,
          },
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('deleteSettings error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to delete settings' } });
    }
  }
}
