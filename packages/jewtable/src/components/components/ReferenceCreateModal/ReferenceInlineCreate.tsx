/**
 * ReferenceInlineCreate Component
 * Phase 11: ERP Integration Features (Phase B)
 *
 * Simple inline creation form for quick item creation directly in the dropdown
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReferenceConfig } from '../../types/reference.types';
import styles from './ReferenceInlineCreate.module.css';

interface ReferenceInlineCreateProps {
  config: ReferenceConfig;
  onSuccess: (item: any) => void;
  onCancel: () => void;
}

/**
 * Default API create function
 */
async function defaultCreateFn(endpoint: string, data: any): Promise<any> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to create item');
  }

  return response.json();
}

/**
 * ReferenceInlineCreate - Simple inline creation form
 */
export function ReferenceInlineCreate({
  config,
  onSuccess,
  onCancel,
}: ReferenceInlineCreateProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (inputValue: string) => {
      if (!inputValue.trim()) {
        throw new Error('Value is required');
      }

      // Build data object
      const data: any = {
        [config.label as string]: inputValue.trim(),
      };

      // Run beforeSave hook if provided
      let processedData = data;
      if (config.create?.form?.hooks?.beforeSave) {
        processedData = await config.create.form.hooks.beforeSave(data);
      }

      // Use custom create function or default
      const createFn = config.createFn || ((cfg, d) => defaultCreateFn(cfg.endpoint, d));
      const newItem = await createFn(config, processedData);

      // Run afterSave hook if provided
      if (config.create?.form?.hooks?.afterSave) {
        await config.create.form.hooks.afterSave(newItem);
      }

      return newItem;
    },
    onSuccess: (newItem) => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['reference', config.type] });

      // Call success callback
      onSuccess(newItem);

      // Reset form
      setValue('');
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createMutation.mutate(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles.inlineCreate}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter new ${config.type}...`}
          className={`${styles.input} ${errorMessage ? styles.inputError : ''}`}
          disabled={createMutation.isPending}
          autoFocus
        />

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={createMutation.isPending || !value.trim()}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
