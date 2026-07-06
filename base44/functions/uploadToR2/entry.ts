import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { AwsClient } from 'npm:aws4fetch@1.0.20';

// Uploads an image/video to Cloudflare R2 (S3-compatible) via a signed fetch PUT
// and returns the public URL. Uses aws4fetch (native fetch) — the heavy
// @aws-sdk/client-s3 hangs/times out in the Deno runtime.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { fileData, fileName, contentType } = body || {};
    if (!fileData) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    const campaignId = (body.campaignId || 'file').toString().replace(/[^a-zA-Z0-9._-]/g, '-');

    // fileData is a base64 string (optionally with a data: prefix).
    const base64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const type = contentType || 'application/octet-stream';

    const endpoint = (Deno.env.get('R2_ENDPOINT') || '').replace(/\/$/, '');
    const bucket = Deno.env.get('R2_BUCKET_NAME');
    const publicBase = (Deno.env.get('R2_PUBLIC_URL_BASE') || '').replace(/\/$/, '');

    // Path: uploads/{user_id}/{campaign_id}_{timestamp}.{ext}
    const nameExt = (fileName || '').includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    const ext = nameExt || (type.split('/')[1] || 'bin');
    const key = `uploads/${user.id}/${campaignId}_${Date.now()}.${ext}`;

    const aws = new AwsClient({
      accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID'),
      secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY'),
      service: 's3',
      region: 'auto',
    });

    const res = await aws.fetch(`${endpoint}/${bucket}/${key}`, {
      method: 'PUT',
      body: binary,
      headers: { 'Content-Type': type },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('uploadToR2 R2 error:', res.status, text);
      return Response.json({ error: `Upload failed (${res.status})` }, { status: 500 });
    }

    return Response.json({ fileUrl: `${publicBase}/${key}`, key });
  } catch (error) {
    console.error('uploadToR2 error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});