const CUSTOMER_CODE = import.meta.env.VITE_CLOUDFLARE_STREAM_CUSTOMER_CODE as string | undefined;

export function getStreamPlayerUrl(videoUid: string): string | null {
  if (!CUSTOMER_CODE) return null;
  return `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${videoUid}/iframe`;
}

export function getSignedStreamPlayerUrl(token: string): string | null {
  if (!CUSTOMER_CODE) return null;
  return `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${token}/iframe`;
}

export function getStreamThumbnailUrl(videoUid: string, time = '35%'): string | null {
  if (!CUSTOMER_CODE) return null;
  return `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${videoUid}/thumbnails/thumbnail.jpg?time=${time}&width=640`;
}

export function isStreamConfigured(): boolean {
  return !!CUSTOMER_CODE;
}
