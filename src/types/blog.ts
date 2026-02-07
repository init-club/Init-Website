export type BlogStatus = 'pending' | 'approved_admin' | 'published' | 'rejected';

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_name: string;
  roll_no: string;
  phone_number?: string;
  tags: string[];
  status: BlogStatus;
  cover_image_url?: string;
  published_at?: string;
  created_at: string;
  user_id?: string;
}

export interface BlogFormData {
  author_name: string;
  roll_no: string;
  phone_number: string;
  title: string;
  content: string;
  tags: string[];
  cover_image_url: string;
}
