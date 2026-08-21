"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";

import {
  finalizeProductMedia,
  type MediaActionState,
} from "@/app/cms/(workspace)/products/[id]/media/actions";
import { Button } from "@/components/ui/button";
import {
  MAX_MEDIA_SOURCE_BYTES,
  MEDIA_UPLOAD_MIME_TYPES,
  type MediaUploadMimeType,
} from "@/features/cms/domain/media-upload";
import { createClient } from "@/lib/supabase/client";

const initialState: MediaActionState = {};

export function MediaUploadForm({ productId }: { productId: number }) {
  const [state, setState] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const busy = uploading || pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) {
      setUploadError(true);
      setUploadMessage("Choose a product image.");
      return;
    }

    if (
      !MEDIA_UPLOAD_MIME_TYPES.includes(file.type as MediaUploadMimeType) ||
      file.size > MAX_MEDIA_SOURCE_BYTES
    ) {
      setUploadError(true);
      setUploadMessage(
        "Use a JPEG, PNG, WebP, or AVIF image no larger than 15 MB.",
      );
      return;
    }

    if (
      formData.get("makePrimary") === "on" &&
      formData.get("rightsApproved") !== "on"
    ) {
      setUploadError(true);
      setUploadMessage("Only rights-approved media can become primary.");
      return;
    }

    setUploading(true);
    setUploadError(false);
    setState(initialState);
    setUploadMessage("Preparing a secure private upload…");

    try {
      const response = await fetch(
        `/api/cms/products/${productId}/media/upload-token`,
        {
          body: JSON.stringify({ byteSize: file.size, mimeType: file.type }),
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const payload: unknown = await response.json();
      const result =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : {};

      if (
        !response.ok ||
        typeof result.path !== "string" ||
        typeof result.token !== "string"
      ) {
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : "A secure upload could not be prepared.",
        );
      }

      setUploadMessage("Uploading the private original…");
      const upload = await createClient()
        .storage.from("catalog-source")
        .uploadToSignedUrl(result.path, result.token, file, {
          cacheControl: "0",
          contentType: file.type,
          upsert: false,
        });

      if (upload.error) {
        throw new Error("The private original could not be uploaded.");
      }

      setUploadMessage("Validating and optimizing the catalog image…");
      formData.delete("file");
      formData.set("sourceByteSize", String(file.size));
      formData.set("sourceMimeType", file.type);
      formData.set("sourcePath", result.path);
      startTransition(async () => {
        try {
          const nextState = await finalizeProductMedia(
            productId,
            initialState,
            formData,
          );
          setState(nextState);
          setUploadMessage(undefined);
          if (nextState.success) {
            formRef.current?.reset();
          }
        } catch {
          setUploadError(true);
          setUploadMessage(
            "Your session changed before processing finished. Sign in and try again.",
          );
        }
      });
    } catch (error) {
      setUploadError(true);
      setUploadMessage(
        error instanceof Error ? error.message : "The upload could not finish.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="mt-5 grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      <div>
        <label className="text-sm font-semibold" htmlFor="file">
          Product image
        </label>
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-2 block min-h-12 w-full rounded-xl border border-smoke/30 bg-white p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-orbit-gold file:px-4 file:py-2 file:font-semibold"
          disabled={busy}
          id="file"
          name="file"
          required
          type="file"
        />
        <p className="mt-2 text-xs leading-5 text-smoke">
          JPEG, PNG, WebP, or AVIF; maximum 15 MB. A content-hashed WebP
          derivative is generated automatically.
        </p>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="altText">
          Accurate alt text
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-smoke/30 px-4 text-sm"
          disabled={busy}
          id="altText"
          maxLength={220}
          minLength={5}
          name="altText"
          placeholder="Black acetate optical frame, front view"
          required
        />
      </div>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          className="mt-1"
          disabled={busy}
          name="rightsApproved"
          type="checkbox"
        />
        I have confirmed this image can be used for the product catalog.
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          className="mt-1"
          disabled={busy}
          name="makePrimary"
          type="checkbox"
        />
        Make this the primary product image after processing.
      </label>
      {uploadMessage || state.message ? (
        <p
          aria-live="polite"
          className={
            state.success && !uploadMessage
              ? "text-sm text-signal-green"
              : uploadMessage && !uploadError
                ? "text-sm text-smoke"
                : "text-sm text-signal-red"
          }
          role="status"
        >
          {uploadMessage ?? state.message}
        </p>
      ) : null}
      <Button className="justify-self-start" disabled={busy} type="submit">
        {busy ? "Processing…" : "Upload and optimize"}
      </Button>
    </form>
  );
}
