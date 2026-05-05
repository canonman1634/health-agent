import { NextRequest, NextResponse } from "next/server";

const APP_PASSWORD = process.env.APP_PASSWORD || "healthagent";
const API_TOKEN = process.env.API_TOKEN || "healthagent-api-token";

export function checkApiAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === API_TOKEN;
  }
  // Also check cookie for web UI requests
  const cookie = request.cookies.get("auth")?.value;
  return cookie === APP_PASSWORD;
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function checkWebAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get("auth")?.value;
  return cookie === APP_PASSWORD;
}
