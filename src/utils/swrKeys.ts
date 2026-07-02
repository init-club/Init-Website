export const SWR_KEYS = {
  SITE_SETTINGS: 'site_settings',
  ADMIN_BLOGS: 'admin_blogs',
  ADMIN_PROJECTS: 'admin_projects',
  ADMIN_MEMBERS: 'admin_members',
  ADMIN_SESSIONS: 'admin_sessions',
  FORMS_LIST: 'forms_list',
  form: (id: string) => `form:${id}`,
  formResponses: (id: string) => `form_responses:${id}`,
  publicForm: (slug: string) => `public_form:${slug}`,
} as const;
