import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';
import type { CreateGallerySubmissionRequest, CreateGallerySubmissionResponse, MarkUploadCompleteRequest } from '../types';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'Apikey': SUPABASE_ANON_KEY,
  };
}

async function callFunction<T>(slug: string, body?: unknown, method = 'POST'): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export async function createGallerySubmission(req: CreateGallerySubmissionRequest): Promise<CreateGallerySubmissionResponse> {
  return callFunction<CreateGallerySubmissionResponse>('create-gallery-submission', req);
}

export async function markGalleryUploadComplete(req: MarkUploadCompleteRequest): Promise<{ status: string }> {
  return callFunction<{ status: string }>('mark-gallery-upload-complete', req);
}

export async function getStreamPlaybackToken(submissionId: string): Promise<string> {
  const data = await callFunction<{ token: string }>('get-stream-playback-token', { submissionId });
  return data.token;
}

export async function moderateGallerySubmission(submissionId: string, action: string, note?: string): Promise<void> {
  await callFunction('moderate-gallery-submission', { submissionId, action, note });
}

export async function updateGallerySubmission(submissionId: string, fields: Record<string, string | null>): Promise<void> {
  await callFunction('update-gallery-submission', { submissionId, ...fields });
}

export async function deleteGallerySubmission(submissionId: string): Promise<void> {
  await callFunction('delete-gallery-submission', { submissionId });
}

export async function toggleGalleryLike(videoId: string): Promise<{ liked: boolean; likeCount: number }> {
  return callFunction<{ liked: boolean; likeCount: number }>('toggle-gallery-like', { videoId });
}

export async function createStreamUploadUrl(submissionId: string, fileSize: number, fileName: string): Promise<{ uploadUrl: string; videoUid: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const metadata = [
    `name ${btoa(fileName)}`,
    `maxdurationseconds ${btoa('300')}`,
    `requiresignedurls ${btoa('true')}`,
    `thumbnailtimestamppct ${btoa('0.35')}`,
    `submissionid ${btoa(submissionId)}`,
  ].join(',');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-stream-upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Apikey': SUPABASE_ANON_KEY,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(fileSize),
      'Upload-Metadata': metadata,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Upload creation failed' }));
    throw new Error(body.error || `Upload creation failed (${res.status})`);
  }

  const uploadUrl = res.headers.get('Location');
  const videoUid = res.headers.get('stream-media-id');

  if (!uploadUrl || !videoUid) {
    throw new Error('Missing upload URL or video UID from response');
  }

  return { uploadUrl, videoUid };
}
