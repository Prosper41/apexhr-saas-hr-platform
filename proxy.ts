import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/leave-request",
  "/approvals",
  "/team-calendar",
  "/people",
  "/leave-policies",
  "/audit-log",
  "/settings",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  if (
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) &&
    !accessToken
  ) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leave-request/:path*",
    "/approvals/:path*",
    "/team-calendar/:path*",
    "/people/:path*",
    "/leave-policies/:path*",
    "/audit-log/:path*",
    "/settings/:path*",
  ],
};
