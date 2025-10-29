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
  const [initialPosition, setInitialPosition] = useState({ top: 0, left: 0 });
  const rafRef = useRef<number | null>(null);

  // Calculate position based on anchor element
  useEffect(() => {
    if (!anchorElement || !popoverRef.current) return;

    const calculatePosition = () => {
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

      // Vertical positioning: keep near icon, ensure visible on screen
      let top = rect.bottom + 8; // Default: below the filter icon

      // Ensure popover doesn't go below viewport
      const maxTop = viewportHeight - popoverMaxHeight - 16;
      if (top > maxTop) {
        // Adjust upward to fit in viewport, but stay near the icon
        top = Math.max(8, maxTop);
      }

      // If really tight space and icon is near bottom, try above
      if (spaceBelow < 200 && spaceAbove > spaceBelow + 50) {
        top = Math.max(8, rect.top - popoverMaxHeight - 8);
      }

      return { top, left };
    };

    const updatePosition = () => {
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (!popoverRef.current) return;

        const { top, left } = calculatePosition();

        // Update transform directly without triggering React re-render
        // Use translate3d for better GPU acceleration
        popoverRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      });
    };

    // Set initial position via state (for first render)
    const initial = calculatePosition();
    setInitialPosition(initial);

    // Listen for scroll and resize with passive listeners for better performance
    window.addEventListener('scroll', updatePosition, { passive: true, capture: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', updatePosition, { capture: true } as any);
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
        top: 0,
        left: 0,
        transform: `translate3d(${initialPosition.left}px, ${initialPosition.top}px, 0)`,
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
