import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { AwsClient } from 'npm:aws4fetch@1.0.20';

// Deletes one of the current user's uploads from Cloudflare R2 via a signed DELETE.
// Only keys under uploads/{user_id}/ may be deleted (ownership check).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { key } = await req.json();
    if (!key) return Response.json({ error: 'Missing key' }, { status: 400 });

    // Ownership guard — user can only delete their own files.
    if (!key.startsWith(`uploads/${user.id}/`)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const endpoint = (Deno.env.get('R2_ENDPOINT') || '').replace(/\/$/, '');
    const bucket = Deno.env.get('R2_BUCKET_NAME');

    const aws = new AwsClient({
      accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID'),
      secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY'),
      service: 's3',
      region: 'auto',
    });

    const res = await aws.fetch(`${endpoint}/${bucket}/${key}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      console.error('deleteR2Upload R2 error:', res.status, text);
      return Response.json({ error: `Delete failed (${res.status})` }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('deleteR2Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});