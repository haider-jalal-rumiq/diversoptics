import { signOut } from "@/app/cms/(workspace)/actions";
import { Button } from "@/components/ui/button";
import type { CurrentStaff } from "@/features/cms/auth/staff";

export function CmsHeader({ staff }: { staff: CurrentStaff }) {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-smoke/15 bg-white px-5 sm:px-8">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-brass-ink uppercase">
          Diverso Optics
        </p>
        <p className="mt-1 text-sm text-smoke">
          Signed in as {staff.email ?? staff.displayName ?? "staff"}
        </p>
      </div>
      <form action={signOut}>
        <Button className="px-4" tone="quiet" type="submit">
          Sign out
        </Button>
      </form>
    </header>
  );
}
