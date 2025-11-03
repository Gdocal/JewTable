/**
 * Cell type definitions
 */

export enum CellType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATE_RANGE = 'dateRange',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  BADGE = 'badge', // Phase 10.4: Badge cell for status/command labels
  PROGRESS = 'progress', // Phase 10.10: Progress bar cell
  REFERENCE = 'reference', // Phase 11: Reference data cell with lazy loading
  CUSTOM = 'custom',
}

export interface BaseCellProps<TValue = unknown> {
  value: TValue;
  rowId: string;
  columnId: string;
  isEditing: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  onChange?: (value: TValue) => void;
  onSave?: (value: TValue) => void;
  onCancel?: () => void;
}

export interface TextCellValue {
  text: string;
}

export interface NumberCellValue {
  value: number;
  format?: 'decimal' | 'currency' | 'percent';
  decimals?: number;
  currencySymbol?: string;
}

export interface DateCellValue {
  date: Date | string;
  format?: string; // date-fns format string
}

export interface DateRangeCellValue {
  startDate: Date | string;
  endDate: Date | string;
  format?: string;
}

export interface SelectCellValue {
  value: string | string[];
  options: SelectOption[];
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CheckboxCellValue {
  checked: boolean;
  label?: string;
}

export interface CustomCellValue {
  data: unknown;
}

export type CellValue =
  | TextCellValue
  | NumberCellValue
  | DateCellValue
  | DateRangeCellValue
  | SelectCellValue
  | CheckboxCellValue
  | CustomCellValue;
