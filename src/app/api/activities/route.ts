import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const dateParam = request.nextUrl.searchParams.get("date");
  const offsetParam = request.nextUrl.searchParams.get("offset");
  const offsetMs = offsetParam ? parseInt(offsetParam) * 60 * 1000 : 0;
  const dateStr = dateParam ?? new Date().toISOString().split("T")[0];
  const startOfDay = new Date(new Date(dateStr + "T00:00:00Z").getTime() + offsetMs);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const result = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.userId, 1),
        gte(activities.recordedAt, startOfDay),
        lt(activities.recordedAt, endOfDay)
      )
    )
    .orderBy(activities.recordedAt);

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const result = await db
    .insert(activities)
    .values({
      userId: 1,
      activityType: body.activityType,
      durationMinutes: body.durationMinutes || null,
      caloriesBurned: body.caloriesBurned || null,
      description: body.description || null,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
