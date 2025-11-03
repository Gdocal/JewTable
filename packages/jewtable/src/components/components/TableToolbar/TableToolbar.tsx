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
  // Don't render the toolbar if it has no content
  if (!isReadOnly) {
    return null;
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        {/* Future: Bulk actions, export, import, etc. */}
      </div>

      <div className={styles.rightSection}>
        <span className={styles.readOnlyBadge} title="This table is read-only">
          Read-only
        </span>
      </div>
    </div>
  );
}
