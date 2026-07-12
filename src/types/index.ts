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

export type GallerySourceType =
  | 'youtube'
  | 'supabase_storage'
  | 'cloudflare_stream';

export type GalleryUploadStatus =
  | 'pending_upload'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error'
  | 'cancelled';

export type GalleryModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'removed';

export type TeslaVehicleModel =
  | 'model-3'
  | 'model-y'
  | 'model-s'
  | 'model-x'
  | 'cybertruck'
  | 'other';

export interface GalleryVideo {
  id: string;
  user_id: string;
  title: string;
  storage_path: string | null;
  youtube_id: string | null;
  description: string | null;
  created_at: string;
  source_type: GallerySourceType;
  cloudflare_video_uid: string | null;
  slug: string | null;
  song_title: string | null;
  artist_name: string | null;
  vehicle_model: TeslaVehicleModel | null;
  occasion: string | null;
  genre: string | null;
  story: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  input_width: number | null;
  input_height: number | null;
  upload_status: GalleryUploadStatus;
  moderation_status: GalleryModerationStatus;
  is_public: boolean;
  featured: boolean;
  view_count: number;
  like_count: number;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  processing_error_code: string | null;
  processing_error_message: string | null;
  copyright_attested_at: string | null;
  updated_at: string;
}

export interface CreateGallerySubmissionRequest {
  title: string;
  vehicleModel: TeslaVehicleModel;
  occasion?: string | null;
  songTitle?: string | null;
  artistName?: string | null;
  genre?: string | null;
  story?: string | null;
  rightsAttested: true;
}

export interface CreateGallerySubmissionResponse {
  submissionId: string;
}

export interface MarkUploadCompleteRequest {
  submissionId: string;
  cloudflareVideoUid: string;
}

export interface CreditGrant {
  id: string;
  admin_user_id: string;
  recipient_user_id: string;
  credits_granted: number;
  note: string | null;
  created_at: string;
}
