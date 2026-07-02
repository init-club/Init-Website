import type { Form, FormField, FormSettings, SerializedFormItemInput } from '../types/form';

const defaultSettings: FormSettings = {
  allow_multiple_responses: true,
  require_auth: false,
  open_at: null,
  close_at: null,
  success_message: 'Thank you for your response!',
  redirect_url: null,
  max_responses: null,
  show_progress_bar: true,
};

function compactValidation(field: FormField): Record<string, unknown> | undefined {
  if (!field.validation) return undefined;

  const validation = Object.fromEntries(
    Object.entries(field.validation).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );

  return Object.keys(validation).length > 0 ? validation : undefined;
}

export function serializeFormFields(fields: FormField[]): SerializedFormItemInput[] {
  return fields
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((field, index) => {
      const config: Record<string, unknown> = {};
      const validation = compactValidation(field);

      if (field.placeholder?.trim()) {
        config.placeholder = field.placeholder.trim();
      }

      if (field.type === 'rating') {
        config.scale = field.scale ?? 5;
      }

      if (validation) {
        config.validation = validation;
      }

      const serialized: SerializedFormItemInput = {
        item_id: field.id,
        kind: field.type,
        title: field.label.trim() || 'Untitled Field',
        description: field.helpText?.trim() || null,
        required: field.type === 'section' ? false : field.required,
        position: index,
      };

      if (Object.keys(config).length > 0) {
        serialized.config = config;
      }

      if (['select', 'radio', 'multiselect'].includes(field.type)) {
        serialized.options = (field.options || [])
          .map((option) => option.trim())
          .filter((option) => option.length > 0);
      }

      return serialized;
    });
}

export function normalizeFormSettings(settings: Partial<FormSettings> | null | undefined): FormSettings {
  return {
    ...defaultSettings,
    ...(settings || {}),
  };
}

export function normalizeFormRecord(record: any): Form {
  return {
    ...record,
    fields: Array.isArray(record?.fields)
      ? [...record.fields].sort((a: FormField, b: FormField) => a.order - b.order)
      : [],
    settings: normalizeFormSettings(record?.settings),
  };
}
