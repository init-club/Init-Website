import { supabase } from '../supabaseClient';

export const fetchSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('discord_link, instagram_link, linkedin_link, allow_public_blogs')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
};

export const fetchAdminBlogs = async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchAdminProjects = async () => {
  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('is_visible', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchAdminMembers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, auth_user_id, username, name, role, avatar_url, custom_title,
      contribution_stats (
        month,
        year,
        score,
        score_adjustment,
        adjustment_reason
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchAdminSessions = async () => {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchAllForms = async () => {
  const { data, error } = await supabase
    .from('forms')
    .select('*, form_responses(count)')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  
  // Format to append response_count directly
  return (data || []).map((form: any) => ({
    ...form,
    response_count: form.form_responses?.[0]?.count || 0
  }));
};

export const fetchFormById = async (formId: string) => {
  if (!formId) return null;
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchFormResponses = async (formId: string) => {
  if (!formId) return [];
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchPublicFormBySlug = async (slug: string) => {
  if (!slug) return null;
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data;
};
