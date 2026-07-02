import slugify from 'slugify';
import type { Form, FormField, FormResponse } from '../types/form';

/**
 * Generate a clean URL-friendly slug from a title string.
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
}

/**
 * Creates the default fields that are pre-populated when creating a new form.
 */
export function createDefaultFields(): FormField[] {
  return [
    {
      id: 'f-name-' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g. Arjun Sharma',
      required: true,
      order: 0
    },
    {
      id: 'f-roll-' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      label: 'Roll Number',
      placeholder: 'e.g. CB.EN.U4CSE22001',
      required: true,
      order: 1
    }
  ];
}

/**
 * Performs client-side validation on form answers.
 * Returns a record mapping fieldId -> error message (or null if valid).
 */
export function validateAnswers(
  fields: FormField[],
  answers: Record<string, any>
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};

  fields.forEach(field => {
    if (field.type === 'section') return;

    const val = answers[field.id];
    const isProvided = val !== undefined && val !== null && (typeof val === 'string' ? val.trim() !== '' : true) && (Array.isArray(val) ? val.length > 0 : true);

    // Required check
    if (field.required && !isProvided) {
      errors[field.id] = 'This field is required';
      return;
    }

    if (!isProvided) {
      errors[field.id] = null;
      return;
    }

    // Type specific checks
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof val === 'string' && !emailRegex.test(val)) {
        errors[field.id] = 'Please enter a valid email address';
        return;
      }
    }

    if (field.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        errors[field.id] = 'Please enter a valid number';
        return;
      }
      if (field.validation?.min !== undefined && field.validation?.min !== null && num < field.validation.min) {
        errors[field.id] = `Value must be at least ${field.validation.min}`;
        return;
      }
      if (field.validation?.max !== undefined && field.validation?.max !== null && num > field.validation.max) {
        errors[field.id] = `Value cannot exceed ${field.validation.max}`;
        return;
      }
    }

    if (field.type === 'text' || field.type === 'textarea') {
      if (typeof val === 'string') {
        const text = val.trim();
        if (field.validation?.minLength !== undefined && field.validation?.minLength !== null && text.length < field.validation.minLength) {
          errors[field.id] = `Text must be at least ${field.validation.minLength} characters`;
          return;
        }
        if (field.validation?.maxLength !== undefined && field.validation?.maxLength !== null && text.length > field.validation.maxLength) {
          errors[field.id] = `Text cannot exceed ${field.validation.maxLength} characters`;
          return;
        }
        if (field.validation?.pattern) {
          try {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(text)) {
              errors[field.id] = 'Format is invalid';
              return;
            }
          } catch (e) {
            console.error('Invalid regular expression pattern:', field.validation.pattern);
          }
        }
      }
    }

    if (field.type === 'multiselect') {
      if (Array.isArray(val) && val.length === 0 && field.required) {
        errors[field.id] = 'Please select at least one option';
        return;
      }
    }

    errors[field.id] = null;
  });

  return errors;
}

/**
 * Builds and downloads a CSV file containing all form responses client-side.
 */
export function exportResponsesAsCsv(form: Form, responses: FormResponse[]): void {
  const nonSectionFields = [...form.fields]
    .filter(f => f.type !== 'section')
    .sort((a, b) => a.order - b.order);

  const headers = ['Submitted At', ...nonSectionFields.map(f => f.label)];

  const rows = responses.map(r => [
    new Date(r.submitted_at).toISOString(),
    ...nonSectionFields.map(f => {
      const val = r.answers[f.id];
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) return val.join(';');
      return String(val);
    })
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${form.slug}-responses-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
