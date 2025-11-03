/**
 * ReferenceCreateModal Component
 * Phase 11: ERP Integration Features (Phase B)
 *
 * Modal for creating new reference items with form validation
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReferenceConfig, CustomModalProps, FormFieldConfig } from '../../types/reference.types';
import styles from './ReferenceCreateModal.module.css';

interface ReferenceCreateModalProps {
  config: ReferenceConfig;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: any) => void;
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
 * Render a single form field
 */
function FormField({ field, form }: { field: FormFieldConfig; form: any }) {
  const error = form.formState.errors[field.name];

  switch (field.type) {
    case 'text':
      return (
        <div className={styles.formGroup}>
          <label htmlFor={field.name} className={styles.label}>
            {field.label || field.name}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <input
            id={field.name}
            type="text"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder={field.placeholder}
            {...form.register(field.name)}
          />
          {field.hint && <small className={styles.hint}>{field.hint}</small>}
          {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
      );

    case 'number':
      return (
        <div className={styles.formGroup}>
          <label htmlFor={field.name} className={styles.label}>
            {field.label || field.name}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <input
            id={field.name}
            type="number"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            {...form.register(field.name, { valueAsNumber: true })}
          />
          {field.hint && <small className={styles.hint}>{field.hint}</small>}
          {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
      );

    case 'textarea':
      return (
        <div className={styles.formGroup}>
          <label htmlFor={field.name} className={styles.label}>
            {field.label || field.name}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <textarea
            id={field.name}
            className={`${styles.textarea} ${error ? styles.inputError : ''}`}
            placeholder={field.placeholder}
            rows={4}
            {...form.register(field.name)}
          />
          {field.hint && <small className={styles.hint}>{field.hint}</small>}
          {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
      );

    case 'boolean':
      return (
        <div className={styles.formGroupCheckbox}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              {...form.register(field.name)}
            />
            <span>
              {field.label || field.name}
              {field.required && <span className={styles.required}>*</span>}
            </span>
          </label>
          {field.hint && <small className={styles.hint}>{field.hint}</small>}
          {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
      );

    case 'select':
      // TODO: Support reference type selects in future iteration
      return (
        <div className={styles.formGroup}>
          <label htmlFor={field.name} className={styles.label}>
            {field.label || field.name}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          <select
            id={field.name}
            className={`${styles.select} ${error ? styles.inputError : ''}`}
            {...form.register(field.name)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {field.hint && <small className={styles.hint}>{field.hint}</small>}
          {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
      );

    default:
      return null;
  }
}

/**
 * ReferenceCreateModal - Modal for creating new reference items
 */
export function ReferenceCreateModal({
  config,
  isOpen,
  onClose,
  onSuccess,
}: ReferenceCreateModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If custom component provided, render it
  if (config.create?.component) {
    const CustomComponent = config.create.component;

    const customProps: CustomModalProps = {
      isOpen,
      onClose,
      onSave: async (data: any) => {
        const createFn = config.createFn || ((cfg, d) => defaultCreateFn(cfg.endpoint, d));
        const newItem = await createFn(config, data);

        // Invalidate cache
        queryClient.invalidateQueries({ queryKey: ['reference', config.type] });

        onSuccess(newItem);
      },
      config,
    };

    return <CustomComponent {...customProps} />;
  }

  // Default modal with form
  if (!config.create?.form?.fields) {
    return null;
  }

  const { fields, validation, layout = 'vertical', columns = 1 } = config.create.form;

  // Setup form with validation
  // @ts-ignore - Dynamic validation schema
  const form = useForm(validation ? { resolver: zodResolver(validation) } : undefined);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
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
      form.reset();
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    setErrorMessage(null);
    createMutation.mutate(data);
  });

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Create New {config.type}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} id="create-form">
            {errorMessage && (
              <div className={styles.errorBanner}>
                {errorMessage}
              </div>
            )}

            <div
              className={`${styles.formFields} ${
                layout === 'grid' ? styles.formGrid : styles.formVertical
              }`}
              style={layout === 'grid' ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
            >
              {fields.map((field) => (
                <FormField key={field.name} field={field} form={form} />
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-form"
            className={styles.saveButton}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
