/**
 * RowDetailsModal - Modal for displaying detailed row information
 * Phase 10.8: Modal for Row Details
 */

import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CellType } from '../../types/cell.types';
import styles from './RowDetailsModal.module.css';

interface RowDetailsModalProps<TData> {
  row: TData;
  columns: ColumnDef<TData>[];
  onClose: () => void;
  isOpen: boolean;
  onSave?: (rowId: string, updates: Partial<TData>) => void;
  enableEditing?: boolean;
  // Enhancement 2: Custom content rendering
  renderCustomContent?: (
    row: TData,
    isEditing: boolean,
    onSave: (updates: Partial<TData>) => void,
    onCancel: () => void
  ) => React.ReactNode;
}

export function RowDetailsModal<TData extends Record<string, any>>({
  row,
  columns,
  onClose,
  isOpen,
  onSave,
  enableEditing = true,
  renderCustomContent,
}: RowDetailsModalProps<TData>) {
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset edit state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setEditedData({});
      setErrors({});
    }
  }, [isOpen]);
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter out special columns (actions, drag, selection, expand)
  const dataColumns = columns.filter((col: any) => {
    const meta = col.meta;
    return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && col.id !== 'actions';
  });

  // Validate field
  const validateField = (columnId: string, value: any, column: any): string | null => {
    const cellType = column.cellType || CellType.TEXT;

    // Required field validation
    if (column.required && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    // Type-specific validation
    switch (cellType) {
      case CellType.NUMBER:
      case CellType.CURRENCY:
      case CellType.PERCENT:
        if (value !== '' && value !== null && isNaN(Number(value))) {
          return 'Must be a valid number';
        }
        break;
      case CellType.EMAIL:
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Must be a valid email';
        }
        break;
      case CellType.DATE:
        if (value && isNaN(Date.parse(value))) {
          return 'Must be a valid date';
        }
        break;
    }

    return null;
  };

  // Handle field change
  const handleFieldChange = (columnId: string, value: any, column: any) => {
    setEditedData((prev) => ({ ...prev, [columnId]: value }));

    // Validate on change
    const error = validateField(columnId, value, column);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[columnId] = error;
      } else {
        delete newErrors[columnId];
      }
      return newErrors;
    });
  };

  // Handle save
  const handleSave = () => {
    // Validate all edited fields
    const dataColumns = columns.filter((col: any) => {
      const meta = col.meta;
      return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && col.id !== 'actions';
    });

    const validationErrors: Record<string, string> = {};
    dataColumns.forEach((column: any) => {
      const columnId = column.id || column.accessorKey;
      const value = editedData.hasOwnProperty(columnId) ? editedData[columnId] : row[columnId];
      const error = validateField(columnId, value, column);
      if (error) {
        validationErrors[columnId] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Call onSave callback
    if (onSave) {
      onSave(row.id, editedData);
    }

    // Close edit mode
    setIsEditing(false);
    setEditedData({});
    setErrors({});
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
    setErrors({});
  };

  const formatValue = (value: any, column: any): string => {
    if (value === null || value === undefined) return '—';

    const cellType = column.cellType || CellType.TEXT;

    switch (cellType) {
      case CellType.DATE:
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      case CellType.NUMBER:
      case CellType.CURRENCY:
        if (typeof value === 'number') {
          return cellType === CellType.CURRENCY
            ? `$${value.toLocaleString()}`
            : value.toLocaleString();
        }
        return String(value);
      case CellType.PERCENT:
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return String(value);
      case CellType.BOOLEAN:
        return value ? 'Yes' : 'No';
      case CellType.SELECT:
      case CellType.BADGE:
        return String(value);
      case CellType.PROGRESS:
        if (typeof value === 'number') {
          return `${value}%`;
        }
        return String(value);
      default:
        return String(value);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Row Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Enhancement 2: Custom content rendering */}
          {renderCustomContent ? (
            renderCustomContent(
              row,
              isEditing,
              (updates) => {
                // Update edited data
                setEditedData((prev) => ({ ...prev, ...updates }));
              },
              handleCancel
            )
          ) : (
            <div className={styles.fieldList}>
              {dataColumns.map((column: any) => {
              const columnId = column.id || column.accessorKey;
              const columnName = typeof column.header === 'string' ? column.header : columnId;
              const currentValue = editedData.hasOwnProperty(columnId) ? editedData[columnId] : row[columnId];
              const formattedValue = formatValue(currentValue, column);
              const cellType = column.cellType || CellType.TEXT;
              const isEditable = column.editable !== false;
              const error = errors[columnId];

              return (
                <div key={columnId} className={`${styles.field} ${error ? styles.fieldError : ''}`}>
                  <div className={styles.fieldLabel}>
                    {columnName}
                    {column.required && <span className={styles.required}>*</span>}
                  </div>
                  {isEditing && isEditable ? (
                    <div className={styles.fieldInput}>
                      {cellType === CellType.BOOLEAN ? (
                        <input
                          type="checkbox"
                          checked={currentValue || false}
                          onChange={(e) => handleFieldChange(columnId, e.target.checked, column)}
                          className={styles.checkbox}
                        />
                      ) : cellType === CellType.SELECT ? (
                        <select
                          value={currentValue || ''}
                          onChange={(e) => handleFieldChange(columnId, e.target.value, column)}
                          className={styles.select}
                        >
                          <option value="">Select...</option>
                          {column.cellOptions?.options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : cellType === CellType.DATE ? (
                        <input
                          type="date"
                          value={currentValue || ''}
                          onChange={(e) => handleFieldChange(columnId, e.target.value, column)}
                          className={styles.input}
                        />
                      ) : cellType === CellType.NUMBER || cellType === CellType.CURRENCY || cellType === CellType.PERCENT ? (
                        <input
                          type="number"
                          value={currentValue || ''}
                          onChange={(e) => handleFieldChange(columnId, e.target.value, column)}
                          className={styles.input}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => handleFieldChange(columnId, e.target.value, column)}
                          className={styles.input}
                        />
                      )}
                      {error && <div className={styles.errorMessage}>{error}</div>}
                    </div>
                  ) : (
                    <div className={styles.fieldValue}>{formattedValue}</div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className={styles.footer}>
          {isEditing ? (
            <>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={Object.keys(errors).length > 0}
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              {enableEditing && onSave && (
                <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
              <button className={styles.closeFooterButton} onClick={onClose}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
