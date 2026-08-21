import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireCatalogEditor } from "@/features/cms/auth/staff";
import {
  getMediaSourceExtension,
  mediaUploadIntentSchema,
} from "@/features/cms/domain/media-upload";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    await requireCatalogEditor();
  } catch {
    return NextResponse.json(
      { message: "You are not authorized to upload catalog media." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return NextResponse.json(
      { message: "The product reference is invalid." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The upload request is invalid." },
      { status: 400 },
    );
  }

  const parsed = mediaUploadIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Use a JPEG, PNG, WebP, or AVIF image no larger than 15 MB.",
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const product = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (product.error) {
    return NextResponse.json(
      { message: "The product could not be verified." },
      { status: 503 },
    );
  }
  if (!product.data) {
    return NextResponse.json(
      { message: "The product no longer exists." },
      { status: 404 },
    );
  }

  const extension = getMediaSourceExtension(parsed.data.mimeType);
  const sourcePath = `${productId}/originals/${randomUUID()}.${extension}`;
  const signedUpload = await supabase.storage
    .from("catalog-source")
    .createSignedUploadUrl(sourcePath, { upsert: false });

  if (signedUpload.error) {
    return NextResponse.json(
      { message: "A secure upload could not be prepared." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { path: signedUpload.data.path, token: signedUpload.data.token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
