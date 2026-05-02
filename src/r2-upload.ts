/**
 * Cloudflare R2 upload helpers.
 *
 * Layout in the bucket:
 *   avatars/<userId>.<ext>
 *   thumbnails/<videoId>.<ext>
 *   uploads/<userId>/<uuid>.<ext>     (general user uploads)
 */

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024     // 10 MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024    // 200 MB

export interface UploadResult {
  key: string
  url: string
  size: number
  content_type: string
}

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  }
  return map[contentType] || 'bin'
}

export interface PutOptions {
  bucket: R2Bucket
  body: ArrayBuffer | ReadableStream
  contentType: string
  key: string
  publicBase?: string
  cacheControl?: string
}

export async function putObject(opts: PutOptions): Promise<UploadResult> {
  const { bucket, body, contentType, key, publicBase, cacheControl } = opts
  const obj = await bucket.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: cacheControl || 'public, max-age=31536000, immutable',
    },
  })
  if (!obj) throw new Error('R2 put failed')
  return {
    key,
    url: publicBase ? `${publicBase}/${key}` : `/api/uploads/${key}`,
    size: obj.size,
    content_type: contentType,
  }
}

/**
 * Upload an avatar (image only). Replaces any prior avatar for this user.
 */
export async function uploadAvatar(
  bucket: R2Bucket,
  userId: number,
  body: ArrayBuffer,
  contentType: string,
  publicBase?: string
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`)
  }
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`File too large (max 10MB)`)
  }
  const ext = extFromContentType(contentType)
  const key = `avatars/${userId}.${ext}`
  return putObject({ bucket, body, contentType, key, publicBase })
}

/**
 * Upload a video thumbnail (image only). Used by the video crawler when a
 * platform thumbnail needs to be re-hosted (e.g. for grade-tagged videos).
 */
export async function uploadThumbnail(
  bucket: R2Bucket,
  videoId: number,
  body: ArrayBuffer,
  contentType: string,
  publicBase?: string
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`)
  }
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`File too large (max 10MB)`)
  }
  const ext = extFromContentType(contentType)
  const key = `thumbnails/${videoId}.${ext}`
  return putObject({ bucket, body, contentType, key, publicBase })
}

/**
 * General user upload — for video posts, profile media, etc.
 */
export async function uploadUserMedia(
  bucket: R2Bucket,
  userId: number,
  body: ArrayBuffer,
  contentType: string,
  publicBase?: string
): Promise<UploadResult> {
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType)
  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType)
  if (!isImage && !isVideo) {
    throw new Error(`Invalid content type: ${contentType}`)
  }
  const max = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
  if (body.byteLength > max) {
    throw new Error(`File too large`)
  }
  const ext = extFromContentType(contentType)
  const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`
  return putObject({ bucket, body, contentType, key, publicBase })
}

/**
 * Serve an object from R2 with proper caching.
 */
export async function serveObject(
  bucket: R2Bucket,
  key: string
): Promise<Response> {
  const obj = await bucket.get(key)
  if (!obj) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'public, max-age=31536000, immutable')
  }
  return new Response(obj.body, { headers })
}

export async function deleteObject(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}
