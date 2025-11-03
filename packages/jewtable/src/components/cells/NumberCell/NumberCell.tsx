/**
 * NumberCell - Display numeric values with formatting
 * Phase 1: Read-only version
 */

import React from 'react';
import { formatNumber, formatCurrency, formatPercent } from '../../utils/formatters';
import styles from './NumberCell.module.css';

interface NumberCellProps {
  value: number | null | undefined;
  format?: 'decimal' | 'currency' | 'percent';
  decimals?: number;
  currencySymbol?: string;
}

export function NumberCell({
  value,
  format = 'decimal',
  decimals = 2,
  currencySymbol = '$',
}: NumberCellProps) {
  if (value == null || isNaN(value)) {
    return <span className={styles.numberCell}>—</span>;
  }

  let displayValue: string;

  switch (format) {
    case 'currency':
      displayValue = formatCurrency(value, decimals, currencySymbol);
      break;
    case 'percent':
      displayValue = formatPercent(value, decimals);
      break;
    case 'decimal':
    default:
      displayValue = formatNumber(value, decimals);
      break;
  }

  return <span className={styles.numberCell}>{displayValue}</span>;
}
