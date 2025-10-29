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
  const currentPositionRef = useRef({ top: 0, left: 0 });

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

      // Vertical positioning: use available space intelligently
      let top: number;

      // Calculate available space
      const minMargin = 16;
      const maxBottomPosition = viewportHeight - minMargin;

      // Try positioning below icon first
      const belowPosition = rect.bottom + 8;
      const belowBottom = belowPosition + popoverMaxHeight;

      // Try positioning above icon
      const abovePosition = rect.top - popoverMaxHeight - 8;

      // Choose best position based on available space
      if (belowBottom <= maxBottomPosition) {
        // Fits below - use this position
        top = belowPosition;
      } else if (abovePosition >= minMargin) {
        // Doesn't fit below, but fits above
        top = abovePosition;
      } else {
        // Doesn't fit well in either position - use best fit
        // Position it to maximize visible area
        if (spaceBelow >= spaceAbove) {
          // More space below - position to show as much as possible below
          top = Math.max(minMargin, maxBottomPosition - popoverMaxHeight);
        } else {
          // More space above - position to show as much as possible
          top = minMargin;
        }
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

        const rect = anchorElement.getBoundingClientRect();
        const popoverHeight = popoverRef.current.offsetHeight || popoverMaxHeight;
        const popoverWidth = popoverRef.current.offsetWidth || 280;

        // Get current position
        let { top, left } = currentPositionRef.current;

        // Update horizontal position to follow icon (horizontal scroll)
        left = rect.right - popoverWidth;
        if (left < 16) left = 16;
        if (left + popoverWidth > window.innerWidth - 16) {
          left = window.innerWidth - popoverWidth - 16;
        }

        // For vertical: only adjust if popover would go off screen
        const currentBottom = top + popoverHeight;
        const viewportHeight = window.innerHeight;

        // Check if current position is still valid
        if (currentBottom > viewportHeight - 16) {
          // Going off bottom - move up
          top = Math.max(16, viewportHeight - popoverHeight - 16);
        } else if (top < 16) {
          // Going off top - move down
          top = 16;
        }
        // Otherwise keep current vertical position (don't follow icon)

        // Save new position
        currentPositionRef.current = { top, left };

        // Update transform directly without triggering React re-render
        // Use translate3d for better GPU acceleration
        popoverRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      });
    };

    // Set initial position via state (for first render)
    const initial = calculatePosition();
    setInitialPosition(initial);
    currentPositionRef.current = initial;

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
