/**
 * BadgeCell component
 * Phase 10.4: Badge column for status and command labels
 */

import React from 'react';
import styles from './BadgeCell.module.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

export interface Badge {
  label: string;
  variant?: BadgeVariant;
  icon?: string; // Optional emoji or icon
}

export interface BadgeCellProps {
  value: Badge | Badge[] | string | null;
  defaultVariant?: BadgeVariant;
}

export function BadgeCell({ value, defaultVariant = 'secondary' }: BadgeCellProps) {
  // Handle null/undefined
  if (!value) {
    return <div className={styles.badgeCell}>-</div>;
  }

  // Convert string to Badge object
  const normalizeBadge = (val: Badge | string): Badge => {
    if (typeof val === 'string') {
      return { label: val, variant: defaultVariant };
    }
    return { ...val, variant: val.variant || defaultVariant };
  };

  // Handle single badge or array of badges
  const badges = Array.isArray(value) ? value.map(normalizeBadge) : [normalizeBadge(value)];

  return (
    <div className={styles.badgeCell}>
      {badges.map((badge, index) => (
        <span
          key={index}
          className={`${styles.badge} ${styles[`badge${capitalize(badge.variant || defaultVariant)}`]}`}
          title={badge.label}
        >
          {badge.icon && <span className={styles.icon}>{badge.icon}</span>}
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
