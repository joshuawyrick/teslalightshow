export interface Profile {
  id: string;
  email: string;
  credits: number;
  snippet_used: boolean;
  is_admin: boolean;
  admin_role: 'owner' | 'editor' | 'viewer' | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  stripe_session_id: string;
  package_name: string;
  credits_purchased: number;
  amount_cents: number;
  created_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  song_name: string;
  rendition_id: string;
  rendition_name: string;
  vehicle_model: string;
  storage_path: string;
  is_snippet: boolean;
  created_at: string;
  expires_at: string;
}

export interface GalleryVideo {
  id: string;
  user_id: string;
  title: string;
  storage_path: string | null;
  youtube_id: string | null;
  description: string | null;
  created_at: string;
}

export interface CreditGrant {
  id: string;
  admin_user_id: string;
  recipient_user_id: string;
  credits_granted: number;
  note: string | null;
  created_at: string;
}
