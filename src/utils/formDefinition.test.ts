import { describe, it, expect } from 'vitest';
import { serializeFormFields, normalizeFormSettings, normalizeFormRecord } from './formDefinition';
import type { FormField } from '../types/form';

const field = (overrides: Partial<FormField> & Pick<FormField, 'id' | 'type'>): FormField => ({
  label: 'Field',
  required: false,
  order: 0,
  ...overrides,
});

describe('serializeFormFields', () => {
  it('sorts by order and renumbers position from zero', () => {
    const out = serializeFormFields([
      field({ id: 'c', type: 'text', order: 30 }),
      field({ id: 'a', type: 'text', order: 10 }),
      field({ id: 'b', type: 'text', order: 20 }),
    ]);
    expect(out.map((f) => f.item_id)).toEqual(['a', 'b', 'c']);
    expect(out.map((f) => f.position)).toEqual([0, 1, 2]);
  });

  it('does not mutate the array it was given', () => {
    const fields = [
      field({ id: 'b', type: 'text', order: 2 }),
      field({ id: 'a', type: 'text', order: 1 }),
    ];
    serializeFormFields(fields);
    expect(fields.map((f) => f.id)).toEqual(['b', 'a']);
  });

  it('falls back to a placeholder title rather than saving an empty one', () => {
    const [out] = serializeFormFields([field({ id: 'a', type: 'text', label: '   ' })]);
    expect(out.title).toBe('Untitled Field');
  });

  it('trims the title', () => {
    const [out] = serializeFormFields([field({ id: 'a', type: 'text', label: '  Name  ' })]);
    expect(out.title).toBe('Name');
  });

  it('forces required to false on section headers', () => {
    const [out] = serializeFormFields([field({ id: 's', type: 'section', required: true })]);
    expect(out.required).toBe(false);
  });

  it('omits config entirely when there is nothing to put in it', () => {
    const [out] = serializeFormFields([field({ id: 'a', type: 'text' })]);
    expect(out.config).toBeUndefined();
  });

  it('keeps a trimmed placeholder but drops a blank one', () => {
    const [withPlaceholder] = serializeFormFields([
      field({ id: 'a', type: 'text', placeholder: '  hi  ' }),
    ]);
    expect(withPlaceholder.config).toEqual({ placeholder: 'hi' });

    const [blank] = serializeFormFields([field({ id: 'a', type: 'text', placeholder: '   ' })]);
    expect(blank.config).toBeUndefined();
  });

  it('defaults a rating scale to 5 and respects an explicit one', () => {
    const [defaulted] = serializeFormFields([field({ id: 'a', type: 'rating' })]);
    expect(defaulted.config).toEqual({ scale: 5 });

    const [explicit] = serializeFormFields([field({ id: 'a', type: 'rating', scale: 10 })]);
    expect(explicit.config).toEqual({ scale: 10 });
  });

  it('strips null, undefined and empty-string validation entries', () => {
    const [out] = serializeFormFields([
      field({
        id: 'a',
        type: 'text',
        validation: { min: null, max: undefined, pattern: '', minLength: 3 },
      }),
    ]);
    expect(out.config).toEqual({ validation: { minLength: 3 } });
  });

  it('drops validation altogether when every entry was empty', () => {
    const [out] = serializeFormFields([
      field({ id: 'a', type: 'text', validation: { min: null, pattern: '' } }),
    ]);
    expect(out.config).toBeUndefined();
  });

  it('keeps a minLength of 0, which is a real bound', () => {
    const [out] = serializeFormFields([
      field({ id: 'a', type: 'text', validation: { minLength: 0 } }),
    ]);
    expect(out.config).toEqual({ validation: { minLength: 0 } });
  });

  it.each(['select', 'radio', 'multiselect'] as const)(
    'serializes trimmed, non-empty options for %s',
    (type) => {
      const [out] = serializeFormFields([
        field({ id: 'a', type, options: ['  One  ', '', '   ', 'Two'] }),
      ]);
      expect(out.options).toEqual(['One', 'Two']);
    }
  );

  it('emits an empty options array for a choice field with none set', () => {
    const [out] = serializeFormFields([field({ id: 'a', type: 'select' })]);
    expect(out.options).toEqual([]);
  });

  it('does not attach options to non-choice fields', () => {
    const [out] = serializeFormFields([field({ id: 'a', type: 'text', options: ['x'] })]);
    expect(out.options).toBeUndefined();
  });

  it('maps helpText to description, and blank helpText to null', () => {
    const [withHelp] = serializeFormFields([
      field({ id: 'a', type: 'text', helpText: '  useful  ' }),
    ]);
    expect(withHelp.description).toBe('useful');

    const [without] = serializeFormFields([field({ id: 'a', type: 'text', helpText: '  ' })]);
    expect(without.description).toBeNull();
  });
});

describe('normalizeFormSettings', () => {
  const defaults = {
    allow_multiple_responses: true,
    require_auth: false,
    open_at: null,
    close_at: null,
    success_message: 'Thank you for your response!',
    redirect_url: null,
    max_responses: null,
    show_progress_bar: true,
  };

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty object', {}],
  ])('returns the full defaults for %s', (_label, input) => {
    expect(normalizeFormSettings(input)).toEqual(defaults);
  });

  it('lets a partial override win while filling in the rest', () => {
    expect(normalizeFormSettings({ require_auth: true, max_responses: 50 })).toEqual({
      ...defaults,
      require_auth: true,
      max_responses: 50,
    });
  });

  it('allows a stored false to override a default of true', () => {
    expect(normalizeFormSettings({ show_progress_bar: false }).show_progress_bar).toBe(false);
  });
});

describe('normalizeFormRecord', () => {
  it('sorts fields by order', () => {
    const out = normalizeFormRecord({
      id: 'f1',
      fields: [
        { id: 'b', order: 2 },
        { id: 'a', order: 1 },
      ],
    });
    expect(out.fields.map((f) => f.id)).toEqual(['a', 'b']);
  });

  it.each([
    ['a missing fields key', {}],
    ['a null fields value', { fields: null }],
    ['a non-array fields value', { fields: 'oops' }],
  ])('yields an empty fields array for %s', (_label, record) => {
    expect(normalizeFormRecord(record).fields).toEqual([]);
  });

  it('fills in settings defaults when the record has none', () => {
    expect(normalizeFormRecord({ id: 'f1' }).settings.success_message)
      .toBe('Thank you for your response!');
  });

  it('preserves every other column on the record', () => {
    const out = normalizeFormRecord({ id: 'f1', slug: 'my-form', status: 'published' });
    expect(out.id).toBe('f1');
    expect(out.slug).toBe('my-form');
    expect(out.status).toBe('published');
  });
});
