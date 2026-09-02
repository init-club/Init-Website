import { supabase } from '../supabaseClient';
import { normalizeFormRecord } from './formDefinition';

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

export const fetchLeaderboard = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, username, name, avatar_url, custom_title,
      contribution_stats (
        month,
        year,
        score,
        score_adjustment
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

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
  const { data, error } = await supabase.rpc('list_forms_overview');

  if (error) throw error;

  return data || [];
};

export const fetchPublishedForms = async () => {
  const { data, error } = await supabase
    .from('forms')
    .select('id, slug, title, description, status, updated_at, created_at, settings')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return data || [];
};

export const fetchFormById = async (formId: string) => {
  if (!formId) return null;
  const { data, error } = await supabase.rpc('get_form_definition', {
    p_form_id: formId,
  });

  if (error) throw error;
  if (!data) return null;

  return normalizeFormRecord(data);
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

export const fetchApprovedIdeaWallEntries = async () => {
  const { data, error } = await supabase
    .from('idea_wall_entries')
    .select(`
      id,
      response_id,
      full_name,
      repository_name,
      repository_link,
      repository_description,
      phone_number,
      is_visible,
      approved_at,
      created_at,
      updated_at
    `)
    .eq('is_visible', true)
    .order('approved_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
};

export const fetchIdeaWallEntriesForResponses = async (
  responseIds: string[]
) => {
  if (responseIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('idea_wall_entries')
    .select(`
      id,
      response_id,
      full_name,
      repository_name,
      repository_link,
      repository_description,
      phone_number,
      is_visible,
      approved_at,
      created_at,
      updated_at
    `)
    .in('response_id', responseIds);

  if (error) throw error;

  return data || [];
};

export const publishIdeaWallEntry = async (entry: {
  response_id: string;
  full_name: string;
  repository_name: string;
  repository_link: string;
  repository_description: string | null;
  phone_number: string | null;
}) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('idea_wall_entries')
    .upsert(
      {
        ...entry,

        is_visible: true,

        approved_at: now,
        updated_at: now,
      },
      {
        onConflict: 'response_id',
      }
    )
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const unpublishIdeaWallEntry = async (
  responseId: string
) => {
  const { error } = await supabase
    .from('idea_wall_entries')
    .update({
      is_visible: false,
      updated_at: new Date().toISOString(),
    })
    .eq('response_id', responseId);

  if (error) throw error;
};

export const fetchPublicFormBySlug = async (slug: string) => {
  if (!slug) return null;
  const { data, error } = await supabase.rpc('get_public_form_definition', {
    p_slug: slug,
  });

  if (error) throw error;
  if (!data) return null;

  return normalizeFormRecord(data);
};
