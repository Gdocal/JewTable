/**
 * GlobalSearch - Quick search across all columns
 * Phase 3: Filtering
 */

import React, { useState, useEffect } from 'react';
import styles from './GlobalSearch.module.css';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function GlobalSearch({
  value,
  onChange,
  placeholder = 'Search all columns...',
  debounceMs = 300,
}: GlobalSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
        />
        {localValue && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            title="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
