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
  headerElement: HTMLElement | null; // Table header for stable vertical positioning
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
  headerElement,
}: FilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [initialPosition, setInitialPosition] = useState({ top: 0, left: 0, maxHeight: 0 });
  const rafRef = useRef<number | null>(null);

  // Wait for refs to be available
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (anchorElement && headerElement) {
      setIsReady(true);
    }
  }, [anchorElement, headerElement]);

  // Calculate position based on header and anchor elements
  useEffect(() => {
    if (!isReady || !anchorElement || !headerElement || !popoverRef.current) return;

    const calculatePosition = () => {
      const anchorRect = anchorElement.getBoundingClientRect();
      const headerRect = headerElement.getBoundingClientRect();
      const popoverWidth = 280; // min-width from CSS
      const viewportHeight = window.innerHeight;
      const margin = 8;

      // Horizontal positioning: right-aligned with filter icon
      let left = anchorRect.right - popoverWidth;

      // Adjust if popover would go off left edge
      if (left < 16) {
        left = 16;
      }

      // Adjust if popover would go off right edge
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      // Vertical positioning: ANCHOR TO HEADER BOTTOM (stable reference)
      // This is the key insight from Gemini - don't track the icon, track the header
      const top = headerRect.bottom + margin;

      // Calculate maxHeight: available space from header bottom to viewport bottom
      const availableHeight = viewportHeight - headerRect.bottom - margin * 2;
      const maxHeight = Math.max(200, availableHeight); // Minimum 200px

      return { top, left, maxHeight };
    };

    const updatePosition = () => {
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (!popoverRef.current) return;

        const { top, left, maxHeight } = calculatePosition();

        // Update transform and maxHeight directly without triggering React re-render
        // Use translate3d for better GPU acceleration
        popoverRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        popoverRef.current.style.maxHeight = `${maxHeight}px`;
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
  }, [isReady, anchorElement, headerElement]);

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

  if (!anchorElement || !headerElement) return null;

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
        maxHeight: `${initialPosition.maxHeight}px`,
        zIndex: 1000,
        opacity: isReady ? 1 : 0, // Hide until positioned
        pointerEvents: isReady ? 'auto' : 'none', // Disable interaction until ready
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
