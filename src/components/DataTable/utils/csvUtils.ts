/**
 * CSV Import/Export Utilities
 * Phase 10.9: Import/Export CSV
 */

import { ColumnDef } from '@tanstack/react-table';

/**
 * Export table data to CSV file
 */
export function exportToCSV<TData extends Record<string, any>>(
  data: TData[],
  columns: ColumnDef<TData>[],
  filename: string = 'export.csv'
): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Filter out special columns (actions, drag, selection, expand)
  const dataColumns = columns.filter((col: any) => {
    const meta = col.meta;
    return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && col.id !== 'actions' && col.id !== '_actions';
  });

  // Get column headers
  const headers = dataColumns.map((col: any) => {
    return typeof col.header === 'string' ? col.header : (col.id || col.accessorKey);
  });

  // Get column IDs for data extraction
  const columnIds = dataColumns.map((col: any) => col.id || col.accessorKey);

  // Build CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map(escapeCSVValue).join(','));

  // Add data rows
  data.forEach((row) => {
    const values = columnIds.map((id) => {
      const value = row[id];
      return escapeCSVValue(formatValue(value));
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Escape CSV value (handle quotes and commas)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format value for CSV export
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Handle numbers
  if (typeof value === 'number') {
    return String(value);
  }

  // Everything else as string
  return String(value);
}

/**
 * Import CSV file and parse to data array
 */
export function importFromCSV<TData extends Record<string, any>>(
  file: File,
  columns: ColumnDef<TData>[],
  onSuccess: (data: TData[]) => void,
  onError: (error: string) => void
): void {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length === 0) {
        onError('CSV file is empty');
        return;
      }

      // First row is headers
      const headers = rows[0];
      const dataRows = rows.slice(1);

      // Filter out special columns
      const dataColumns = columns.filter((col: any) => {
        const meta = col.meta;
        return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && col.id !== 'actions' && col.id !== '_actions';
      });

      // Map headers to column IDs
      const columnIds = dataColumns.map((col: any) => col.id || col.accessorKey);
      const columnHeaders = dataColumns.map((col: any) =>
        typeof col.header === 'string' ? col.header : (col.id || col.accessorKey)
      );

      // Validate headers match
      const missingHeaders = columnHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        onError(`Missing columns in CSV: ${missingHeaders.join(', ')}`);
        return;
      }

      // Parse data rows
      const importedData: TData[] = dataRows.map((row, index) => {
        const rowData: any = {
          id: `import_${Date.now()}_${index}`, // Generate unique ID
        };

        headers.forEach((header, i) => {
          const columnIndex = columnHeaders.indexOf(header);
          if (columnIndex !== -1) {
            const columnId = columnIds[columnIndex];
            rowData[columnId] = row[i] || '';
          }
        });

        return rowData as TData;
      });

      onSuccess(importedData);
    } catch (error) {
      onError(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  reader.onerror = () => {
    onError('Error reading file');
  };

  reader.readAsText(file);
}

/**
 * Parse CSV text into 2D array
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      currentRow.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // End of row
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      }
      // Skip \r\n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentValue += char;
    }
  }

  // Add last value and row if exists
  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
}
