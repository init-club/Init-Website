export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  is_archived: boolean;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  // Graveyard-specific fields
  archival_reason: string | null;
  is_revivable: boolean;
}
