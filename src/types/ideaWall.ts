export interface IdeaWallEntry {
  id: string;
  response_id: string;

  full_name: string;
  repository_name: string;
  repository_link: string;
  repository_description: string | null;
  phone_number: string | null;
  collaborator_count?: number | null;
  open_for_team?: boolean | null;

  is_visible: boolean;

  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaWallEntryDraft {
  response_id: string;

  full_name: string;
  repository_name: string;
  repository_link: string;
  repository_description: string | null;
  phone_number: string | null;
  collaborator_count?: number | null;
  open_for_team?: boolean | null;
}