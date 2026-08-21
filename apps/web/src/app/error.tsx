"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="grid min-h-screen place-items-center bg-porcelain px-6 py-16"
      id="main"
    >
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-[0.12em]">
          SOMETHING WENT WRONG
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none">
          Let’s try that again.
        </h1>
        <p className="mt-5 text-base leading-7 text-smoke">
          The page could not be shown. Your browser has not sent an inquiry or
          changed a shortlist.
        </p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
