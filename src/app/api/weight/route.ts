import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weightLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await db
    .select()
    .from(weightLogs)
    .where(eq(weightLogs.userId, 1))
    .orderBy(desc(weightLogs.recordedAt))
    .limit(days);

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const result = await db
    .insert(weightLogs)
    .values({
      userId: 1,
      weight: body.weight,
      notes: body.notes || null,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
