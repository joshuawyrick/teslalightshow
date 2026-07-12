import { useState, useCallback, useRef } from 'react';
import * as tus from 'tus-js-client';
import { createGallerySubmission, createStreamUploadUrl, markGalleryUploadComplete } from '../lib/gallery';
import type { CreateGallerySubmissionRequest } from '../types';

export type UploadState =
  | 'idle'
  | 'validating'
  | 'creating_submission'
  | 'uploading'
  | 'paused'
  | 'retrying'
  | 'processing'
  | 'submitted'
  | 'error'
  | 'cancelled';

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percent: number;
}

export function useGalleryUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<UploadProgress>({ bytesUploaded: 0, bytesTotal: 0, percent: 0 });
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  const reset = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setState('idle');
    setProgress({ bytesUploaded: 0, bytesTotal: 0, percent: 0 });
    setError(null);
    setSubmissionId(null);
  }, []);

  const cancel = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setState('cancelled');
  }, []);

  const pause = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      setState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.start();
      setState('uploading');
    }
  }, []);

  const startUpload = useCallback(async (file: File, metadata: CreateGallerySubmissionRequest) => {
    setError(null);

    // Validate file
    setState('validating');
    if (file.size > 3 * 1024 * 1024 * 1024) {
      setError('File too large (max 3 GB)');
      setState('error');
      return;
    }

    // Create submission
    setState('creating_submission');
    let subId: string;
    try {
      const res = await createGallerySubmission(metadata);
      subId = res.submissionId;
      setSubmissionId(subId);
    } catch (err) {
      setError((err as Error).message);
      setState('error');
      return;
    }

    // Get tus upload URL
    let uploadUrl: string;
    let videoUid: string;
    try {
      const res = await createStreamUploadUrl(subId, file.size, file.name);
      uploadUrl = res.uploadUrl;
      videoUid = res.videoUid;
    } catch (err) {
      setError((err as Error).message);
      setState('error');
      return;
    }

    // Start tus upload
    setState('uploading');
    const upload = new tus.Upload(file, {
      uploadUrl,
      chunkSize: 52428800,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress({
          bytesUploaded,
          bytesTotal,
          percent: Math.round((bytesUploaded / bytesTotal) * 100),
        });
      },
      onSuccess: async () => {
        setState('processing');
        try {
          await markGalleryUploadComplete({ submissionId: subId, cloudflareVideoUid: videoUid });
          setState('submitted');
        } catch (err) {
          setError((err as Error).message);
          setState('error');
        }
      },
      onError: (err) => {
        setError(err.message || 'Upload failed');
        setState('error');
      },
      onShouldRetry: () => {
        setState('retrying');
        return true;
      },
      onAfterResponse: () => {
        if (state === 'retrying') setState('uploading');
      },
    });

    uploadRef.current = upload;
    upload.start();
  }, [state]);

  return {
    state,
    progress,
    error,
    submissionId,
    startUpload,
    cancel,
    pause,
    resume,
    reset,
  };
}
