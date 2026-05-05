import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const dateParam = request.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

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
