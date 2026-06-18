import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const marketplaceId = formData.get("marketplaceId");
    const source = formData.get("source") || "upload";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload file to storage
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: uint8Array });

    // Determine file type
    const mimeType = file.type || "";
    let fileType = "other";
    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType.startsWith("video/")) fileType = "video";
    else if (mimeType.includes("pdf") || mimeType.includes("document")) fileType = "document";

    // Create MediaLibrary record
    const media = await base44.entities.MediaLibrary.create({
      userId: user.id,
      marketplaceId: marketplaceId || null,
      fileName: file.name,
      fileUrl: file_url,
      fileType,
      source,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ 
      success: true, 
      media: {
        id: media.id,
        fileName: media.fileName,
        fileUrl: media.fileUrl,
        fileType: media.fileType,
        source: media.source,
      }
    });

  } catch (error) {
    console.error("uploadMedia error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});