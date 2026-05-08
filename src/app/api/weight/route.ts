import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weightLogs, goals } from "@/lib/db/schema";
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

  const existingGoal = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, 1))
    .orderBy(desc(goals.createdAt))
    .limit(1);

  if (existingGoal.length > 0) {
    const goal = existingGoal[0];
    const activityLevel = goal.activityLevel as ActivityLevel;
    const tdee = calculateTDEE({
      weightLbs: body.weight,
      activityLevel,
      heightInches: 70,
      age: 41,
      sex: "male",
    });
    const days = daysUntil(goal.targetDate);
    const { deficit } = calculateDailyDeficit(body.weight, goal.targetWeight, days);
    const macros = calculateMacroTargets(tdee, goal.targetWeight, deficit);
    await db.insert(goals).values({
      userId: 1,
      currentWeight: body.weight,
      targetWeight: goal.targetWeight,
      targetDate: goal.targetDate,
      activityLevel,
      dailyCalorieTarget: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
    });
  }

  return NextResponse.json(result[0], { status: 201 });
}
