import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { S3Client, ListObjectsV2Command } from 'npm:@aws-sdk/client-s3@3.600.0';

// Lists the current user's recent uploads from Cloudflare R2 (under uploads/{user_id}/).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const endpoint = Deno.env.get('R2_ENDPOINT');
    const bucket = Deno.env.get('R2_BUCKET_NAME');
    const publicBase = (Deno.env.get('R2_PUBLIC_URL_BASE') || '').replace(/\/$/, '');

    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY'),
      },
    });

    const out = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `uploads/${user.id}/`,
      MaxKeys: 200,
    }));

    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'];
    const videoExts = ['mp4', 'webm', 'mov', 'ogg', 'm4v'];

    const files = (out.Contents || [])
      .filter((o) => o.Key && o.Size > 0)
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
      .map((o) => {
        const ext = (o.Key.split('.').pop() || '').toLowerCase();
        const type = imageExts.includes(ext) ? 'image' : videoExts.includes(ext) ? 'video' : 'other';
        return { url: `${publicBase}/${o.Key}`, key: o.Key, type, size: o.Size, lastModified: o.LastModified };
      })
      .filter((f) => f.type !== 'other');

    return Response.json({ files });
  } catch (error) {
    console.error('listR2Uploads error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});