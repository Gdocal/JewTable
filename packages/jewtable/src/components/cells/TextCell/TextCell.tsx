/**
 * TextCell - Display text values
 * Phase 1: Read-only version
 */

import React from 'react';
import styles from './TextCell.module.css';

interface TextCellProps {
  value: string | null | undefined;
}

export function TextCell({ value }: TextCellProps) {
  const displayValue = value ?? '';

  return <span className={styles.textCell}>{displayValue}</span>;
}
