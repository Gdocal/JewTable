/**
 * DateCell - Display date values with formatting
 * Phase 1: Read-only version
 */

import React from 'react';
import { formatDate, DATE_FORMATS } from '../../utils/formatters';
import styles from './DateCell.module.css';

interface DateCellProps {
  value: Date | string | null | undefined;
  format?: string;
}

export function DateCell({ value, format = DATE_FORMATS.DISPLAY }: DateCellProps) {
  if (!value) {
    return <span className={styles.dateCell}>—</span>;
  }

  const displayValue = formatDate(value, format);

  if (!displayValue) {
    return <span className={styles.dateCell}>Invalid date</span>;
  }

  return <span className={styles.dateCell}>{displayValue}</span>;
}
