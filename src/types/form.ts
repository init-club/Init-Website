export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'multiselect'
  | 'checkbox'
  | 'date'
  | 'rating'
  | 'section';

export interface FieldValidation {
  min?: number | null;
  max?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  order: number;
  options?: string[]; // select, radio, multiselect
  scale?: number;     // rating (e.g. 5 or 10)
  validation?: FieldValidation;
}

export interface FormSettings {
  allow_multiple_responses: boolean;
  require_auth: boolean;
  open_at: string | null;
  close_at: string | null;
  success_message: string;
  redirect_url: string | null;
  max_responses: number | null;
  show_progress_bar: boolean;
}

export interface Form {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'closed';
  fields: FormField[];
  settings: FormSettings;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  answers: Record<string, any>; // maps field.id -> response value
  respondent?: {
    name?: string;
    email?: string;
    auth_user_id?: string;
  };
  metadata?: {
    user_agent?: string;
    submitted_from?: string;
  };
  submitted_at: string;
}
