import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { S3Client, DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@3.600.0';

// Deletes one of the current user's uploads from Cloudflare R2.
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

    const s3 = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY'),
      },
    });

    await s3.send(new DeleteObjectCommand({ Bucket: Deno.env.get('R2_BUCKET_NAME'), Key: key }));

    return Response.json({ success: true });
  } catch (error) {
    console.error('deleteR2Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});