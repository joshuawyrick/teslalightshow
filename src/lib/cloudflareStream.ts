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

export function getVideoLayout(
  width: number | null | undefined,
  height: number | null | undefined,
): { aspectRatio: string; maxWidth: string } {
  if (width && height && height > width) {
    return { aspectRatio: '9 / 16', maxWidth: '440px' };
  }
  return { aspectRatio: '16 / 9', maxWidth: '960px' };
}
