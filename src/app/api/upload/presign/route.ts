import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_FOLDERS = ["avatar", "logo", "media-kit", "attachment", "campaign-brief"] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

const FOLDER_CONSTRAINTS: Record<Folder, { maxBytes: number; accept: string[] }> = {
  avatar: { maxBytes: 2 * 1024 * 1024, accept: ["image/jpeg", "image/png", "image/webp"] },
  logo: { maxBytes: 2 * 1024 * 1024, accept: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"] },
  "media-kit": { maxBytes: 10 * 1024 * 1024, accept: ["application/pdf"] },
  attachment: { maxBytes: 5 * 1024 * 1024, accept: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"] },
  "campaign-brief": { maxBytes: 10 * 1024 * 1024, accept: ["application/pdf", "image/jpeg", "image/png"] },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { filename, contentType, folder } = (body ?? {}) as {
    filename?: string;
    contentType?: string;
    folder?: string;
  };

  if (!filename || !contentType || !folder) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!ALLOWED_FOLDERS.includes(folder as Folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const constraints = FOLDER_CONSTRAINTS[folder as Folder];
  if (!constraints.accept.includes(contentType)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${constraints.accept.join(", ")}` },
      { status: 400 },
    );
  }

  // Sanitise filename and build key
  const ext = filename.split(".").pop() ?? "bin";
  const key = `${folder}/${session.user.id}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 minutes
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
