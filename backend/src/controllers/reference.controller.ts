/**
 * Reference Data Controller
 * Handles generic reference data endpoints (departments, statuses, etc.)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';

export class ReferenceController {
  /**
   * GET /api/references/departments
   * Get all departments with search and pagination
   */
  static async getDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 100, env.MAX_PAGE_SIZE);
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;

      const where: any = {
        organizationId: req.user!.organizationId,
      };

      if (active !== undefined) {
        where.active = active;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [data, totalCount] = await Promise.all([
        prisma.department.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { name: 'asc' },
          include: {
            manager: { select: { id: true, name: true } },
          },
        }),
        prisma.department.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          data,
          totalCount,
          page,
          pageSize,
        },
      });
    } catch (error) {
      console.error('getDepartments error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch departments' } });
    }
  }

  /**
   * POST /api/references/departments
   * Create new department
   */
  static async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await prisma.department.create({
        data: {
          ...req.body,
          organizationId: req.user!.organizationId,
        },
        include: {
          manager: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('createDepartment error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to create department' } });
    }
  }

  /**
   * PUT /api/references/departments/:id
   * Update department
   */
  static async updateDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await prisma.department.update({
        where: { id },
        data: req.body,
        include: {
          manager: { select: { id: true, name: true } },
        },
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('updateDepartment error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to update department' } });
    }
  }

  /**
   * DELETE /api/references/departments/:id
   */
  static async deleteDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.department.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('deleteDepartment error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to delete department' } });
    }
  }

  /**
   * GET /api/references/statuses
   * Get all statuses with search and pagination
   */
  static async getStatuses(req: AuthenticatedRequest, res: Response) {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 100, env.MAX_PAGE_SIZE);
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;

      const where: any = {
        organizationId: req.user!.organizationId,
      };

      if (active !== undefined) {
        where.active = active;
      }

      if (search) {
        where.label = { contains: search, mode: 'insensitive' };
      }

      const [data, totalCount] = await Promise.all([
        prisma.status.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        }),
        prisma.status.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          data,
          totalCount,
          page,
          pageSize,
        },
      });
    } catch (error) {
      console.error('getStatuses error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch statuses' } });
    }
  }

  /**
   * POST /api/references/statuses
   * Create new status
   */
  static async createStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await prisma.status.create({
        data: {
          ...req.body,
          organizationId: req.user!.organizationId,
        },
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('createStatus error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to create status' } });
    }
  }

  /**
   * PUT /api/references/statuses/:id
   * Update status
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await prisma.status.update({
        where: { id },
        data: req.body,
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('updateStatus error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to update status' } });
    }
  }

  /**
   * DELETE /api/references/statuses/:id
   */
  static async deleteStatus(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.status.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('deleteStatus error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to delete status' } });
    }
  }
}
