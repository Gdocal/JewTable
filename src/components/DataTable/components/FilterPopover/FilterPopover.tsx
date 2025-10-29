/**
 * FilterPopover - Column-specific filter UI
 * Phase 3: Filtering
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './FilterPopover.module.css';

interface FilterPopoverProps {
  columnId: string;
  columnName: string;
  filterType: 'text' | 'number' | 'date' | 'select';
  isActive: boolean;
  onClose: () => void;
  onApply: (filter: any) => void;
  onClear: () => void;
  children: React.ReactNode;
  anchorElement: HTMLElement | null;
}

export function FilterPopover({
  columnId,
  columnName,
  filterType,
  isActive,
  onClose,
  onApply,
  onClear,
  children,
  anchorElement,
}: FilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on anchor element
  useEffect(() => {
    if (!anchorElement) return;

    const updatePosition = () => {
      const rect = anchorElement.getBoundingClientRect();
      const popoverWidth = 280; // min-width from CSS
      const popoverMaxHeight = 450; // approximate max height including header/footer
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Horizontal positioning: right-aligned with filter icon
      let left = rect.right - popoverWidth;

      // Adjust if popover would go off left edge
      if (left < 16) {
        left = 16;
      }

      // Adjust if popover would go off right edge
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      // Vertical positioning: prefer below, only go above if clearly better
      let top: number;
      const minSpaceNeeded = 300; // Minimum space to prefer a direction

      if (spaceBelow >= minSpaceNeeded) {
        // Enough space below - position below (preferred)
        top = rect.bottom + 8;
      } else if (spaceAbove >= minSpaceNeeded && spaceAbove > spaceBelow + 100) {
        // Not enough space below, but significantly more space above
        top = Math.max(8, rect.top - popoverMaxHeight - 8);
      } else {
        // Default to below even if limited space (popover has internal scroll)
        top = rect.bottom + 8;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorElement]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorElement]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!anchorElement) return null;

  const popoverContent = (
    <div
      className={styles.popover}
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
      }}
    >
      <div className={styles.header}>
        <h4 className={styles.title}>Filter: {columnName}</h4>
        <button
          className={styles.closeButton}
          onClick={onClose}
          title="Close"
          type="button"
        >
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {children}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.clearButton}
          onClick={() => {
            onClear();
            onClose();
          }}
          type="button"
        >
          Clear
        </button>
        <button
          className={styles.applyButton}
          onClick={onClose}
          type="button"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return createPortal(popoverContent, document.body);
}
