import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { AwsClient } from 'npm:aws4fetch@1.0.20';

// Lists the current user's recent uploads from Cloudflare R2 (under uploads/{user_id}/)
// via a signed ListObjectsV2 GET, parsing the returned XML. Uses aws4fetch (native
// fetch) — the heavy @aws-sdk/client-s3 hangs/times out in the Deno runtime.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const endpoint = (Deno.env.get('R2_ENDPOINT') || '').replace(/\/$/, '');
    const bucket = Deno.env.get('R2_BUCKET_NAME');
    const publicBase = (Deno.env.get('R2_PUBLIC_URL_BASE') || '').replace(/\/$/, '');

    const aws = new AwsClient({
      accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID'),
      secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY'),
      service: 's3',
      region: 'auto',
    });

    const prefix = `uploads/${user.id}/`;
    const url = `${endpoint}/${bucket}?list-type=2&max-keys=200&prefix=${encodeURIComponent(prefix)}`;
    const res = await aws.fetch(url, { method: 'GET' });
    if (!res.ok) {
      const text = await res.text();
      console.error('listR2Uploads R2 error:', res.status, text);
      return Response.json({ files: [] });
    }

    const xml = await res.text();

    // Parse the ListObjectsV2 XML response into { Key, Size, LastModified } records.
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'];
    const videoExts = ['mp4', 'webm', 'mov', 'ogg', 'm4v'];
    const files = [];
    const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;
    while ((match = contentsRegex.exec(xml)) !== null) {
      const block = match[1];
      const key = (block.match(/<Key>([\s\S]*?)<\/Key>/) || [])[1];
      const size = parseInt((block.match(/<Size>([\s\S]*?)<\/Size>/) || [])[1] || '0', 10);
      const lastModified = (block.match(/<LastModified>([\s\S]*?)<\/LastModified>/) || [])[1] || null;
      if (!key || size <= 0) continue;
      const ext = (key.split('.').pop() || '').toLowerCase();
      const type = imageExts.includes(ext) ? 'image' : videoExts.includes(ext) ? 'video' : 'other';
      if (type === 'other') continue;
      files.push({ url: `${publicBase}/${key}`, key, type, size, lastModified });
    }

    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return Response.json({ files });
  } catch (error) {
    console.error('listR2Uploads error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});