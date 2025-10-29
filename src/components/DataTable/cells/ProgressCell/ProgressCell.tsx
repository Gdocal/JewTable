/**
 * ProgressCell component
 * Phase 10.10: Progress bar with percentage display and color coding
 */

import React from 'react';
import styles from './ProgressCell.module.css';

export interface ProgressCellProps {
  value: number | null; // 0-100 percentage
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  thresholds?: {
    danger?: number; // Below this is red (default: 30)
    warning?: number; // Below this is yellow (default: 70)
    success?: number; // Above warning is green
  };
  animated?: boolean;
}

export function ProgressCell({
  value,
  showPercentage = true,
  showLabel = false,
  label,
  thresholds = {},
  animated = false,
}: ProgressCellProps) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <div className={styles.progressCell}>-</div>;
  }

  // Clamp value between 0 and 100
  const percentage = Math.max(0, Math.min(100, value));

  // Determine color based on thresholds
  const dangerThreshold = thresholds.danger ?? 30;
  const warningThreshold = thresholds.warning ?? 70;

  let colorClass = styles.success; // default green
  if (percentage < dangerThreshold) {
    colorClass = styles.danger; // red
  } else if (percentage < warningThreshold) {
    colorClass = styles.warning; // yellow
  }

  return (
    <div className={styles.progressCell}>
      {showLabel && label && (
        <div className={styles.label}>{label}</div>
      )}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${colorClass} ${animated ? styles.animated : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className={styles.percentage}>
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
}
