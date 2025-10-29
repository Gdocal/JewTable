/**
 * TableToolbar - Header toolbar for table actions
 * Phase 5: Row Creation (Improved UX)
 * Reserved for future bulk actions, export, view settings, etc.
 */

import React from 'react';
import styles from './TableToolbar.module.css';

interface TableToolbarProps {
  isReadOnly?: boolean;
}

export function TableToolbar({
  isReadOnly = false,
}: TableToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        {/* Future: Bulk actions, export, import, etc. */}
      </div>

      <div className={styles.rightSection}>
        {isReadOnly && (
          <span className={styles.readOnlyBadge} title="This table is read-only">
            Read-only
          </span>
        )}
      </div>
    </div>
  );
}
