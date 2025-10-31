/**
 * ImportExportButtons - Buttons for importing and exporting CSV data
 * Phase 10.9: Import/Export CSV
 */

import React, { useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { exportToCSV, importFromCSV } from '../../utils/csvUtils';
import styles from './ImportExportButtons.module.css';

interface ImportExportButtonsProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  tableId: string;
  onImport: (data: TData[]) => void;
}

export function ImportExportButtons<TData extends Record<string, any>>({
  data,
  columns,
  tableId,
  onImport,
}: ImportExportButtonsProps<TData>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const filename = `${tableId}_export_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(data, columns, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importFromCSV(
      file,
      columns,
      (importedData) => {
        onImport(importedData);
        alert(`Successfully imported ${importedData.length} rows`);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      (error) => {
        alert(`Import failed: ${error}`);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={handleExport}
        title="Export to CSV"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export CSV
      </button>

      <button
        className={styles.button}
        onClick={handleImportClick}
        title="Import from CSV"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import CSV
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
