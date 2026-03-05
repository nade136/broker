import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN = "/admin/login";
const USER_LOGIN = "/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin: require admin_session, allow /admin/login
  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN) {
      return NextResponse.next();
    }
    const adminSession = request.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
    return NextResponse.next();
  }

  // User dashboard: require user_session, allow /login and /create-account
  if (pathname.startsWith("/dashboard")) {
    const userSession = request.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.redirect(new URL(USER_LOGIN, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
