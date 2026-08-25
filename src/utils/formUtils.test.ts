import { describe, it, expect } from 'vitest';
import { generateSlug, createDefaultFields, validateAnswers } from './formUtils';
import type { FormField } from '../types/form';

/** Minimal field factory so each test only states what it cares about. */
const field = (overrides: Partial<FormField> & Pick<FormField, 'id' | 'type'>): FormField => ({
  label: 'Field',
  required: false,
  order: 0,
  ...overrides,
});

describe('generateSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(generateSlug('Induction Form 2026')).toBe('induction-form-2026');
  });

  it('strips punctuation that would break a URL', () => {
    expect(generateSlug('What\'s New? (v2)')).toBe('whats-new-v2');
  });

  it('trims surrounding whitespace', () => {
    expect(generateSlug('  Spaced Out  ')).toBe('spaced-out');
  });

  it('collapses runs of separators', () => {
    expect(generateSlug('a   b')).toBe('a-b');
  });
});

describe('createDefaultFields', () => {
  it('returns the two onboarding fields in order', () => {
    const fields = createDefaultFields();
    expect(fields).toHaveLength(2);
    expect(fields.map((f) => f.label)).toEqual(['Full Name', 'Roll Number']);
    expect(fields.map((f) => f.order)).toEqual([0, 1]);
    expect(fields.every((f) => f.required)).toBe(true);
  });

  it('gives every call fresh ids, so two new forms never collide', () => {
    const a = createDefaultFields();
    const b = createDefaultFields();
    expect(a[0].id).not.toBe(b[0].id);
    expect(a[1].id).not.toBe(b[1].id);
  });
});

describe('validateAnswers', () => {
  describe('required', () => {
    const required = [field({ id: 'q1', type: 'text', required: true })];

    it.each([
      ['missing key', {}],
      ['undefined', { q1: undefined }],
      ['null', { q1: null }],
      ['empty string', { q1: '' }],
      ['whitespace only', { q1: '   ' }],
      ['empty array', { q1: [] }],
    ])('rejects %s', (_label, answers) => {
      expect(validateAnswers(required, answers)).toEqual({ q1: 'This field is required' });
    });

    it('accepts a real value', () => {
      expect(validateAnswers(required, { q1: 'Arjun' })).toEqual({ q1: null });
    });

    it('accepts 0, which is falsy but present', () => {
      expect(validateAnswers([field({ id: 'q1', type: 'number', required: true })], { q1: 0 }))
        .toEqual({ q1: null });
    });

    it('accepts false, which is falsy but present', () => {
      expect(validateAnswers([field({ id: 'q1', type: 'checkbox', required: true })], { q1: false }))
        .toEqual({ q1: null });
    });
  });

  it('skips section headers entirely — they are layout, not input', () => {
    const fields = [field({ id: 'sec', type: 'section', required: true })];
    expect(validateAnswers(fields, {})).toEqual({});
  });

  it('passes optional fields that were left blank', () => {
    const fields = [field({ id: 'q1', type: 'text', required: false })];
    expect(validateAnswers(fields, {})).toEqual({ q1: null });
  });

  describe('email', () => {
    const fields = [field({ id: 'q1', type: 'email' })];

    it.each(['a@b.co', 'first.last@sub.domain.org'])('accepts %s', (value) => {
      expect(validateAnswers(fields, { q1: value })).toEqual({ q1: null });
    });

    it.each(['plainstring', 'no@domain', '@nolocal.com', 'spaces in@mail.com'])(
      'rejects %s',
      (value) => {
        expect(validateAnswers(fields, { q1: value }))
          .toEqual({ q1: 'Please enter a valid email address' });
      }
    );
  });

  describe('number', () => {
    it('rejects a non-numeric value', () => {
      expect(validateAnswers([field({ id: 'q1', type: 'number' })], { q1: 'abc' }))
        .toEqual({ q1: 'Please enter a valid number' });
    });

    it('enforces min', () => {
      const fields = [field({ id: 'q1', type: 'number', validation: { min: 10 } })];
      expect(validateAnswers(fields, { q1: 9 })).toEqual({ q1: 'Value must be at least 10' });
      expect(validateAnswers(fields, { q1: 10 })).toEqual({ q1: null });
    });

    it('enforces max', () => {
      const fields = [field({ id: 'q1', type: 'number', validation: { max: 5 } })];
      expect(validateAnswers(fields, { q1: 6 })).toEqual({ q1: 'Value cannot exceed 5' });
      expect(validateAnswers(fields, { q1: 5 })).toEqual({ q1: null });
    });

    it('treats a min of 0 as a real bound, not as absent', () => {
      const fields = [field({ id: 'q1', type: 'number', validation: { min: 0 } })];
      expect(validateAnswers(fields, { q1: -1 })).toEqual({ q1: 'Value must be at least 0' });
    });

    it('ignores null bounds', () => {
      const fields = [field({ id: 'q1', type: 'number', validation: { min: null, max: null } })];
      expect(validateAnswers(fields, { q1: 999 })).toEqual({ q1: null });
    });
  });

  describe('text length and pattern', () => {
    it('enforces minLength against the trimmed value', () => {
      const fields = [field({ id: 'q1', type: 'text', validation: { minLength: 3 } })];
      expect(validateAnswers(fields, { q1: 'ab  ' }))
        .toEqual({ q1: 'Text must be at least 3 characters' });
    });

    it('enforces maxLength against the trimmed value', () => {
      const fields = [field({ id: 'q1', type: 'text', validation: { maxLength: 3 } })];
      expect(validateAnswers(fields, { q1: 'abcd' }))
        .toEqual({ q1: 'Text cannot exceed 3 characters' });
      expect(validateAnswers(fields, { q1: 'abc   ' })).toEqual({ q1: null });
    });

    it('applies the same rules to textarea', () => {
      const fields = [field({ id: 'q1', type: 'textarea', validation: { maxLength: 2 } })];
      expect(validateAnswers(fields, { q1: 'abc' }))
        .toEqual({ q1: 'Text cannot exceed 2 characters' });
    });

    it('enforces a regex pattern', () => {
      const fields = [field({ id: 'q1', type: 'text', validation: { pattern: '^CB\\.EN\\.\\w+$' } })];
      expect(validateAnswers(fields, { q1: 'CB.EN.U4CSE22001' })).toEqual({ q1: null });
      expect(validateAnswers(fields, { q1: 'nope' })).toEqual({ q1: 'Format is invalid' });
    });

    it('does not throw on an invalid pattern, and lets the answer through', () => {
      const fields = [field({ id: 'q1', type: 'text', validation: { pattern: '([unclosed' } })];
      expect(() => validateAnswers(fields, { q1: 'anything' })).not.toThrow();
      expect(validateAnswers(fields, { q1: 'anything' })).toEqual({ q1: null });
    });
  });

  it('reports each field independently', () => {
    const fields = [
      field({ id: 'good', type: 'text' }),
      field({ id: 'bad', type: 'email' }),
      field({ id: 'missing', type: 'text', required: true }),
    ];
    expect(validateAnswers(fields, { good: 'ok', bad: 'nope' })).toEqual({
      good: null,
      bad: 'Please enter a valid email address',
      missing: 'This field is required',
    });
  });
});
