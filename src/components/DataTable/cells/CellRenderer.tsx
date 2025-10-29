/**
 * Cell Renderer Factory
 * Routes to appropriate cell component based on cellType
 * Phase 4: Added editable cell support
 */

import React from 'react';
import { CellType } from '../types/cell.types';
import { CellOptions } from '../types/column.types';
import { TextCell } from './TextCell/TextCell';
import { NumberCell } from './NumberCell/NumberCell';
import { DateCell } from './DateCell/DateCell';
import { CheckboxCell } from './CheckboxCell/CheckboxCell';
import { EditableTextCell } from './EditableTextCell/EditableTextCell';
import { EditableNumberCell } from './EditableNumberCell/EditableNumberCell';
import { EditableDateCell } from './EditableDateCell/EditableDateCell';
import { EditableSelectCell } from './EditableSelectCell/EditableSelectCell';
import { EditableCheckboxCell } from './EditableCheckboxCell/EditableCheckboxCell';
import { BadgeCell } from './BadgeCell'; // Phase 10.4: Badge cell

interface CellRendererProps {
  value: unknown;
  cellType?: CellType;
  cellOptions?: CellOptions;
  rowId: string;
  columnId: string;
  isEditing: boolean;
  isEditable?: boolean;
  onStartEdit?: () => void;
  onSave?: (value: any) => void;
  onCancel?: () => void;
  error?: string;
}

export function CellRenderer({
  value,
  cellType = CellType.TEXT,
  cellOptions,
  rowId,
  columnId,
  isEditing,
  isEditable = true,
  onStartEdit = () => {},
  onSave = () => {},
  onCancel = () => {},
  error,
}: CellRendererProps) {
  // If cell is editable, use editable components
  if (isEditable) {
    switch (cellType) {
      case CellType.NUMBER:
        return (
          <EditableNumberCell
            value={value as number}
            onSave={onSave}
            onCancel={onCancel}
            isEditing={isEditing}
            onStartEdit={onStartEdit}
            format={cellOptions?.numberFormat}
            decimals={cellOptions?.decimals}
            currencySymbol={cellOptions?.currencySymbol}
            error={error}
          />
        );

      case CellType.DATE:
        return (
          <EditableDateCell
            value={value as Date | string}
            onSave={onSave}
            onCancel={onCancel}
            isEditing={isEditing}
            onStartEdit={onStartEdit}
            dateFormat={cellOptions?.dateFormat}
            error={error}
          />
        );

      case CellType.SELECT:
        return (
          <EditableSelectCell
            value={value as string}
            onSave={onSave}
            onCancel={onCancel}
            isEditing={isEditing}
            onStartEdit={onStartEdit}
            options={cellOptions?.options || []}
            error={error}
          />
        );

      case CellType.CHECKBOX:
        // Checkbox editing is instant (toggle on click)
        return (
          <EditableCheckboxCell
            value={value as boolean}
            onSave={onSave}
          />
        );

      case CellType.TEXT:
      default:
        return (
          <EditableTextCell
            value={value as string}
            onSave={onSave}
            onCancel={onCancel}
            isEditing={isEditing}
            onStartEdit={onStartEdit}
            error={error}
          />
        );
    }
  }

  // Read-only mode: use original cell components
  switch (cellType) {
    case CellType.NUMBER:
      return (
        <NumberCell
          value={value as number}
          format={cellOptions?.numberFormat}
          decimals={cellOptions?.decimals}
          currencySymbol={cellOptions?.currencySymbol}
        />
      );

    case CellType.DATE:
      return (
        <DateCell
          value={value as Date | string}
          format={cellOptions?.dateFormat}
        />
      );

    case CellType.CHECKBOX:
      return <CheckboxCell value={value as boolean} />;

    case CellType.BADGE:
      return (
        <BadgeCell
          value={value as any}
          defaultVariant={cellOptions?.badgeVariant}
        />
      );

    case CellType.TEXT:
    default:
      return <TextCell value={value as string} />;
  }
}
