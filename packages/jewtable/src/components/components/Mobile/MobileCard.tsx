/**
 * MobileCard Component
 * Displays a table row as a mobile-optimized card
 */

import React, { useState } from 'react';
import { Row, flexRender } from '@tanstack/react-table';
import styles from './MobileCard.module.css';

export interface MobileCardProps<TData> {
  row: Row<TData>;
  enableRowSelection?: boolean;
  enableRowExpanding?: boolean;
  renderExpandedContent?: (row: TData) => React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  titleColumnId?: string; // Column ID to use as card title (default: first visible column)
}

export function MobileCard<TData>({
  row,
  enableRowSelection = false,
  enableRowExpanding = false,
  renderExpandedContent,
  onRowClick,
  titleColumnId,
}: MobileCardProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCells = row.getVisibleCells().filter((cell) => {
    const meta = cell.column.columnDef.meta as any;
    // Filter out special columns (drag, selection, expand, actions)
    return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && !meta?.isActionsColumn;
  });

  // Determine title cell (first visible cell by default, or specified column)
  const titleCell = titleColumnId
    ? visibleCells.find((cell) => cell.column.id === titleColumnId)
    : visibleCells[0];

  // Other cells (all except title)
  const otherCells = visibleCells.filter((cell) => cell !== titleCell);

  const isSelected = row.getIsSelected();

  const handleCardClick = () => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    row.toggleSelected();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className={styles.cardHeader}>
        {enableRowSelection && (
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {titleCell && (
          <h3 className={styles.cardTitle}>
            {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
          </h3>
        )}

        {enableRowExpanding && renderExpandedContent && (
          <button
            className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
            onClick={handleExpandClick}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            ▶
          </button>
        )}
      </div>

      {/* Card Body - Other Fields */}
      <div className={styles.cardBody}>
        {otherCells.map((cell) => {
          const columnHeader = cell.column.columnDef.header;
          const headerText = typeof columnHeader === 'string'
            ? columnHeader
            : cell.column.id;

          return (
            <div key={cell.id} className={styles.field}>
              <div className={styles.fieldLabel}>{headerText}</div>
              <div className={styles.fieldValue}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Content */}
      {isExpanded && renderExpandedContent && (
        <div className={styles.expandedContent}>
          {renderExpandedContent(row.original)}
        </div>
      )}
    </div>
  );
}

// Skeleton loader for loading states
export function MobileCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonCheckbox} />
        <div className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonBody}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonField}>
            <div className={styles.skeletonLabel} />
            <div className={styles.skeletonValue} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty state component
export interface MobileEmptyStateProps {
  message?: string;
  icon?: string;
}

export function MobileEmptyState({
  message = 'No data to display',
  icon = '📋'
}: MobileEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon}</div>
      <p className={styles.emptyStateText}>{message}</p>
    </div>
  );
}
