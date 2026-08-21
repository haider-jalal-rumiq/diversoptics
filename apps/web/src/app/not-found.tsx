import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-porcelain px-6 py-16"
      id="main"
    >
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-[0.12em]">
          404 · NOT FOUND
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none">
          This piece isn’t in the edit.
        </h1>
        <p className="mt-5 text-base leading-7 text-smoke">
          The link may be outdated, or the preview item may no longer be
          available.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
