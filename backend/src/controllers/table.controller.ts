import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { QueryBuilder } from '../utils/queryBuilder';
import { FilterState, SortingState, AuthenticatedRequest } from '../types';
import { env } from '../config/env';

export class TableController {
  // GET /api/tables/employees/data - with advanced filtering/sorting/pagination
  static async getData(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || env.DEFAULT_PAGE_SIZE, env.MAX_PAGE_SIZE);
      const filters: FilterState = req.query.filters ? JSON.parse(req.query.filters as string) : { filters: [], logicOperator: 'AND' };
      const sorting: SortingState = req.query.sorting ? JSON.parse(req.query.sorting as string) : [];
      const search = req.query.search as string;

      // Add search to filters
      if (search) {
        filters.globalSearch = search;
      }

      // Build WHERE clause with ALL filter operators support
      const where = QueryBuilder.buildWhereClause(filters, ['name', 'position']);
      
      // Add organization filter (multi-tenancy)
      Object.assign(where, { organizationId: req.user!.organizationId });

      // Build ORDER BY
      const orderBy = sorting.length > 0 ? QueryBuilder.buildOrderBy(sorting) : [{ createdAt: 'desc' }];

      // Build pagination
      const { skip, take } = QueryBuilder.buildPagination(page, pageSize);

      // Execute query
      const [data, totalCount] = await Promise.all([
        prisma.employee.findMany({
          where,
          orderBy,
          skip,
          take,
          include: { department: true, status: true },
        }),
        prisma.employee.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          data,
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          hasNextPage: page * pageSize < totalCount,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error('getData error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to fetch data' } });
    }
  }

  // POST /api/tables/employees/rows
  static async createRow(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await prisma.employee.create({
        data: {
          ...req.body.data,
          organizationId: req.user!.organizationId,
          createdBy: req.user!.userId,
        },
        include: { department: true, status: true },
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('createRow error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to create row' } });
    }
  }

  // PUT /api/tables/employees/rows/:id - with optimistic locking
  static async updateRow(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { data: updates, version } = req.body;

      // Check version for optimistic locking
      const current = await prisma.employee.findUnique({ where: { id } });
      if (!current) {
        return res.status(404).json({ success: false, error: { message: 'Not found' } });
      }
      if (current.version !== version) {
        return res.status(409).json({ success: false, error: { message: 'Version conflict. Record was modified by another user.' } });
      }

      const data = await prisma.employee.update({
        where: { id },
        data: {
          ...updates,
          version: { increment: 1 },
          updatedBy: req.user!.userId,
        },
        include: { department: true, status: true },
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('updateRow error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to update row' } });
    }
  }

  // DELETE /api/tables/employees/rows/:id
  static async deleteRow(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.employee.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('deleteRow error:', error);
      res.status(500).json({ success: false, error: { message: 'Failed to delete row' } });
    }
  }
}
