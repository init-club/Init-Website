import type { Form, FormResponse } from '../types/form';
import type { IdeaWallEntryDraft } from '../types/ideaWall';

export const PROJECT_CREATION_FORM_TITLE = 'INIT CLUB - PROJECT CREATION';

const normalizeLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const FIELD_LABELS = {
  fullName: ['full name'],

  repositoryName: [
    'repository name',
    'repo name',
  ],

  repositoryLink: [
    'repository link',
    'repository url',
    'repo link',
    'repo url',
  ],

  repositoryDescription: [
    'repository description',
    'repo description',
    'description',
  ],

  phoneNumber: [
    'phone number',
    'phone',
    'mobile number',
    'mobile',
  ],
};

const findFieldId = (
  form: Form,
  labels: string[]
) => {
  const targets = labels.map(normalizeLabel);

  const field = form.fields.find(field =>
    targets.includes(normalizeLabel(field.label))
  );

  return field?.id || null;
};

const getAnswer = (
  form: Form,
  answers: Record<string, any>,
  labels: string[]
) => {
  const fieldId = findFieldId(form, labels);

  return fieldId
    ? answers[fieldId]
    : undefined;
};

const toText = (
  value: unknown
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.join(', ').trim() || null;
  }

  const text = String(value).trim();

  return text || null;
};

const isSafeRepositoryUrl = (
  value: string
) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
};

export const isProjectCreationForm = (
  form: Form
) =>
  normalizeLabel(form.title) ===
  normalizeLabel(PROJECT_CREATION_FORM_TITLE);

export const buildIdeaWallEntryDraft = (
  form: Form,
  response: FormResponse
):
  | { data: IdeaWallEntryDraft }
  | { error: string } => {

  const fullName = toText(
    getAnswer(
      form,
      response.answers,
      FIELD_LABELS.fullName
    )
  );

  const repositoryName = toText(
    getAnswer(
      form,
      response.answers,
      FIELD_LABELS.repositoryName
    )
  );

  const repositoryLink = toText(
    getAnswer(
      form,
      response.answers,
      FIELD_LABELS.repositoryLink
    )
  );

  const repositoryDescription = toText(
    getAnswer(
      form,
      response.answers,
      FIELD_LABELS.repositoryDescription
    )
  );

  const phoneNumber = toText(
    getAnswer(
      form,
      response.answers,
      FIELD_LABELS.phoneNumber
    )
  );

  const missingFields = [
    !fullName ? 'Full Name' : null,
    !repositoryName ? 'Repository Name' : null,
    !repositoryLink ? 'Repository link' : null,
  ].filter(Boolean) as string[];

  if (missingFields.length > 0) {
    return {
      error:
        `Missing required project fields: ` +
        `${missingFields.join(', ')}.`,
    };
  }

  if (!isSafeRepositoryUrl(repositoryLink)) {
    return {
      error:
        'The Repository link must be a valid ' +
        'http:// or https:// URL.',
    };
  }

  return {
    data: {
      response_id: response.id,

      full_name: fullName,
      repository_name: repositoryName,
      repository_link: repositoryLink,

      repository_description:
        repositoryDescription,

      phone_number: phoneNumber,
    },
  };
};