import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";
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
    .from(meals)
    .where(
      and(
        eq(meals.userId, 1),
        gte(meals.recordedAt, startOfDay),
        lt(meals.recordedAt, endOfDay)
      )
    )
    .orderBy(meals.recordedAt);

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const result = await db
    .insert(meals)
    .values({
      userId: 1,
      mealType: body.mealType || "snack",
      description: body.description,
      calories: body.calories || null,
      proteinG: body.proteinG || null,
      carbsG: body.carbsG || null,
      fatG: body.fatG || null,
      sugarG: body.sugarG || null,
      fiberG: body.fiberG || null,
      aiAnalyzed: body.aiAnalyzed || false,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
