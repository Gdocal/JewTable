/**
 * ReferenceCell Component
 * Phase 11: ERP Integration Features
 *
 * Smart dropdown cell for reference data (довідники)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ReferenceCellProps, ReferenceConfig } from '../../types/reference.types';
import { useReferenceData } from '../../hooks/useReferenceData';
import { getReferenceConfig, mergeReferenceConfig } from '../../utils/referenceRegistry';
import { ReferenceCreateModal } from '../../components/ReferenceCreateModal/ReferenceCreateModal';
import { ReferenceInlineCreate } from '../../components/ReferenceCreateModal/ReferenceInlineCreate';
import { HighlightText } from '../../utils/HighlightText';
import styles from './ReferenceCell.module.css';

// Import the registry (will be created by users)
// For now, we'll accept it as a context or prop
let globalRegistry: any = {};

export function setReferenceRegistry(registry: any) {
  globalRegistry = registry;
}

/**
 * ReferenceCell - Smart dropdown for reference data
 *
 * @example
 * ```typescript
 * <ReferenceCell
 *   type="departments"
 *   value={departmentId}
 *   onChange={setDepartmentId}
 * />
 * ```
 */
export function ReferenceCell({
  type,
  value,
  onChange,
  config: configOverride,
  filter,
  disabled = false,
  placeholder,
  onCreateSuccess,
  onSearchChange,
}: ReferenceCellProps) {
  // Get config from registry
  const baseConfig = getReferenceConfig(globalRegistry, type);
  const config = mergeReferenceConfig(baseConfig, configOverride);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data (lazy - only when dropdown opens)
  const { data: options, isLoading, isError, error, refetch } = useReferenceData(
    config,
    {
      enabled: isOpen,
      filter,
      searchQuery: config.search?.type === 'server' ? searchQuery : undefined,
    }
  );

  // Client-side search filtering
  const filteredOptions = useMemo(() => {
    if (!options) return [];

    // Server-side search already filtered
    if (config.search?.type === 'server') {
      return options;
    }

    // Client-side search
    if (config.search?.enabled && searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchFields = config.search.fields || [config.label as string];

      return options.filter((item) => {
        return searchFields.some((field) => {
          const value = (item as any)[field];
          return value?.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    return options;
  }, [options, searchQuery, config.search, config.label]);

  // Get display value for selected item
  const selectedItem = useMemo(() => {
    if (!value || !options) return null;
    return options.find((item) => (item as any)[config.value as string] === value);
  }, [value, options, config.value]);

  const displayValue = useMemo(() => {
    if (!selectedItem) return placeholder || 'Select...';

    // Custom rendering
    if (config.render?.value) {
      return config.render.value(selectedItem);
    }

    // Default rendering
    return (selectedItem as any)[config.label as string];
  }, [selectedItem, config, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  // Handle option selection
  const handleSelect = (option: any) => {
    const newValue = (option as any)[config.value as string];
    onChange(newValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle create button click
  const handleCreateClick = () => {
    const createType = config.create?.form?.type || 'modal';

    if (createType === 'inline') {
      setShowInlineCreate(true);
    } else {
      setShowCreateModal(true);
    }
  };

  // Handle creation success
  const handleCreateSuccess = (newItem: any) => {
    const newValue = (newItem as any)[config.value as string];

    // Close modals/forms
    setShowCreateModal(false);
    setShowInlineCreate(false);

    // Select the newly created item
    onChange(newValue);

    // Call user callback if provided
    if (onCreateSuccess) {
      onCreateSuccess(newItem);
    }

    // Close dropdown
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle create cancel
  const handleCreateCancel = () => {
    setShowCreateModal(false);
    setShowInlineCreate(false);
  };

  return (
    <div className={styles.referenceCell} ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.value}>
          {typeof displayValue === 'string' ? displayValue : displayValue}
        </span>
        <span className={styles.arrow}>▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Search input */}
          {config.search?.enabled && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={config.search.placeholder || 'Search...'}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div className={styles.optionsList}>
            {isLoading && (
              <div className={styles.loadingState}>
                {config.render?.loading ? (
                  config.render.loading()
                ) : (
                  <div className={styles.spinner}>Loading...</div>
                )}
              </div>
            )}

            {isError && (
              <div className={styles.errorState}>
                Error: {error?.message || 'Failed to load data'}
              </div>
            )}

            {!isLoading && !isError && filteredOptions.length === 0 && (
              <div className={styles.emptyState}>
                {config.render?.empty ? (
                  config.render.empty()
                ) : (
                  <div>No results found</div>
                )}
              </div>
            )}

            {!isLoading && !isError && filteredOptions.map((option) => {
              const optionValue = (option as any)[config.value as string];
              const isSelected = optionValue === value;

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {config.render?.option ? (
                    config.render.option(option, searchQuery)
                  ) : (
                    <span>
                      {config.search?.highlightMatches && searchQuery ? (
                        <HighlightText
                          text={(option as any)[config.label as string]}
                          query={searchQuery}
                        />
                      ) : (
                        (option as any)[config.label as string]
                      )}
                    </span>
                  )}
                  {isSelected && <span className={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Inline creation form */}
          {showInlineCreate && (
            <ReferenceInlineCreate
              config={config}
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
            />
          )}

          {/* Footer actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              🔄 Refresh
            </button>

            {/* Create button */}
            {config.create?.enabled && !showInlineCreate && (
              <button
                type="button"
                className={styles.createButton}
                onClick={handleCreateClick}
              >
                + Add New
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <ReferenceCreateModal
          config={config}
          isOpen={showCreateModal}
          onClose={handleCreateCancel}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
