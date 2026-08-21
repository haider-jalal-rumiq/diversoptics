import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

export async function refreshAuthSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  const isLogin = request.nextUrl.pathname === "/cms/login";
  const isCmsRoute = request.nextUrl.pathname.startsWith("/cms");

  if (!config) {
    if (isCmsRoute && !isLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/cms/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    config.url,
    config.publishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, cacheHeaders) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(cacheHeaders).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  // getClaims verifies the JWT signature before protected routing decisions.
  const { data, error } = await supabase.auth.getClaims();
  if ((error || !data?.claims) && isCmsRoute && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/cms/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (data?.claims && isLogin) {
    const cmsUrl = request.nextUrl.clone();
    cmsUrl.pathname = "/cms";
    cmsUrl.search = "";
    return NextResponse.redirect(cmsUrl);
  }

  return response;
}
