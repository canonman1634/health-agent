import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";
import {
  calculateTDEE,
  calculateDailyDeficit,
  calculateMacroTargets,
  daysUntil,
  type ActivityLevel,
} from "@/lib/nutrition/calculator";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, 1))
    .orderBy(desc(goals.createdAt))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json(null);
  }
  return NextResponse.json(result[0]);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const activityLevel = (body.activityLevel || "moderate") as ActivityLevel;

  const tdee = calculateTDEE({
    weightLbs: body.currentWeight,
    activityLevel,
    heightInches: body.heightInches,
    age: body.age,
    sex: body.sex,
  });

  const days = daysUntil(body.targetDate);
  const { deficit, safetyWarning } = calculateDailyDeficit(
    body.currentWeight,
    body.targetWeight,
    days
  );

  const macros = calculateMacroTargets(tdee, body.targetWeight, deficit);

  const result = await db
    .insert(goals)
    .values({
      userId: 1,
      currentWeight: body.currentWeight,
      targetWeight: body.targetWeight,
      targetDate: body.targetDate,
      activityLevel,
      dailyCalorieTarget: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
    })
    .returning();

  return NextResponse.json(
    { ...result[0], tdee, deficit, safetyWarning },
    { status: 201 }
  );
}
