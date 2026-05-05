import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // API routes: check Bearer token
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    const apiToken = process.env.API_TOKEN || "healthagent-api-token";

    if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === apiToken) {
      return NextResponse.next();
    }

    // Also allow cookie auth for API calls from the web UI
    const cookie = request.cookies.get("auth")?.value;
    const appPassword = process.env.APP_PASSWORD || "healthagent";
    if (cookie === appPassword) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Web routes: check cookie
  const cookie = request.cookies.get("auth")?.value;
  const appPassword = process.env.APP_PASSWORD || "healthagent";
  if (cookie !== appPassword) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
