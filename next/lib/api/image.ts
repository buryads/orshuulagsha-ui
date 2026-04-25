import { apiCall } from './client';
import type { DataEnvelope, UploadedImage } from '@/lib/api/types';

const RESOURCE = '/api/jwt/images/burwords';

export async function uploadImageForBurword(
  wordId: number,
  file: File,
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('image', file);

  // Don't set Content-Type — the request interceptor skips JSON defaults for
  // FormData, and the browser must set the multipart boundary itself.
  const body = await apiCall<DataEnvelope<UploadedImage>>(
    'POST',
    `${RESOURCE}/${wordId}`,
    { data: formData },
  );
  return body.data;
}
