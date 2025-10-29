/**
 * Tooltip - Simple hover tooltip component
 */

import React, { ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, text, position = 'top' }: TooltipProps) {
  return (
    <div className={styles.container}>
      {children}
      <div className={`${styles.tooltip} ${styles[position]}`}>
        {text}
      </div>
    </div>
  );
}
