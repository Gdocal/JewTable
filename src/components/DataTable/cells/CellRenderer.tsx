/**
 * Cell Renderer Factory
 * Routes to appropriate cell component based on cellType
 */

import React from 'react';
import { CellType } from '../types/cell.types';
import { CellOptions } from '../types/column.types';
import { TextCell } from './TextCell/TextCell';
import { NumberCell } from './NumberCell/NumberCell';
import { DateCell } from './DateCell/DateCell';
import { CheckboxCell } from './CheckboxCell/CheckboxCell';

interface CellRendererProps {
  value: unknown;
  cellType?: CellType;
  cellOptions?: CellOptions;
  rowId: string;
  columnId: string;
  isEditing: boolean;
}

export function CellRenderer({
  value,
  cellType = CellType.TEXT,
  cellOptions,
  rowId,
  columnId,
  isEditing,
}: CellRendererProps) {
  // Route to appropriate cell component based on type
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

    case CellType.TEXT:
    default:
      return <TextCell value={value as string} />;
  }
}
