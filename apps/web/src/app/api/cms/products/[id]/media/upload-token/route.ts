import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  type CurrentStaff,
  requireCatalogEditor,
} from "@/features/cms/auth/staff";
import {
  getMediaSourceExtension,
  mediaUploadIntentSchema,
} from "@/features/cms/domain/media-upload";
import { hashIdentifier } from "@/lib/security/identifiers";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import {
  isJsonRequest,
  isSameOriginRequest,
} from "@/lib/security/request-origin";
import { logSecurityEvent } from "@/lib/security/security-log";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** A staff member uploading a catalogue usually sends a few dozen files, so this is generous. */
const UPLOAD_TOKEN_RATE_LIMIT = 120;
const UPLOAD_TOKEN_RATE_WINDOW_SECONDS = 600;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  // Cookies alone do not prove the request came from this site, so the origin is
  // checked before anything else runs.
  if (!isSameOriginRequest(request)) {
    logSecurityEvent("csrf.origin_rejected", { route: "media-upload-token" });

    return NextResponse.json(
      { message: "This request must come from the CMS." },
      { status: 403 },
    );
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json(
      { message: "The upload request must be JSON." },
      { status: 415 },
    );
  }

  let staff: CurrentStaff;

  try {
    staff = await requireCatalogEditor();
  } catch {
    return NextResponse.json(
      { message: "You are not authorized to upload catalog media." },
      { status: 403 },
    );
  }

  const withinLimit = await consumeRateLimit({
    bucket: `upload-token:${hashIdentifier("upload-token", staff.id)}`,
    limit: UPLOAD_TOKEN_RATE_LIMIT,
    scope: "upload-token",
    windowSeconds: UPLOAD_TOKEN_RATE_WINDOW_SECONDS,
  });

  if (!withinLimit) {
    return NextResponse.json(
      { message: "Too many uploads. Wait a few minutes and try again." },
      {
        headers: { "Retry-After": String(UPLOAD_TOKEN_RATE_WINDOW_SECONDS) },
        status: 429,
      },
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
    logSecurityEvent("upload.rejected", { reason: "invalid_intent" });

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
