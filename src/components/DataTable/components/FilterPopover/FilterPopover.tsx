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
      const popoverHeight = 400; // approximate max height

      // Position below the filter icon, aligned to the right edge of the icon
      let left = rect.right - popoverWidth;
      let top = rect.bottom + 8;

      // Adjust if popover would go off left edge
      if (left < 16) {
        left = 16;
      }

      // Adjust if popover would go off right edge
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      // Adjust if popover would go off bottom edge
      if (top + popoverHeight > window.innerHeight) {
        // Try positioning above the filter icon
        top = rect.top - popoverHeight - 8;
        // If still not enough space, position at top of viewport
        if (top < 8) {
          top = 8;
        }
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
