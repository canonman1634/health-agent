import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meals, activities, goals, weightLogs } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const dateParam = request.nextUrl.searchParams.get("date");
  const offsetParam = request.nextUrl.searchParams.get("offset");
  const offsetMs = offsetParam ? parseInt(offsetParam) * 60 * 1000 : 0;
  const dateStr = dateParam ?? new Date().toISOString().split("T")[0];
  const startOfDay = new Date(new Date(dateStr + "T00:00:00Z").getTime() + offsetMs);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [dayMeals, dayActivities, currentGoal, recentWeights] =
    await Promise.all([
      db
        .select()
        .from(meals)
        .where(
          and(
            eq(meals.userId, 1),
            gte(meals.recordedAt, startOfDay),
            lt(meals.recordedAt, endOfDay)
          )
        ),
      db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.userId, 1),
            gte(activities.recordedAt, startOfDay),
            lt(activities.recordedAt, endOfDay)
          )
        ),
      db
        .select()
        .from(goals)
        .where(eq(goals.userId, 1))
        .orderBy(desc(goals.createdAt))
        .limit(1),
      db
        .select()
        .from(weightLogs)
        .where(eq(weightLogs.userId, 1))
        .orderBy(desc(weightLogs.recordedAt))
        .limit(7),
    ]);

  const totals = dayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.proteinG || 0),
      carbs: acc.carbs + (meal.carbsG || 0),
      fat: acc.fat + (meal.fatG || 0),
      sugar: acc.sugar + (meal.sugarG || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );

  const caloriesBurned = dayActivities.reduce(
    (sum, a) => sum + (a.caloriesBurned || 0),
    0
  );

  const goal = currentGoal[0] || null;

  return NextResponse.json({
    date: dateStr,
    meals: dayMeals,
    activities: dayActivities,
    totals,
    caloriesBurned,
    netCalories: totals.calories - caloriesBurned,
    goal,
    targets: goal
      ? {
          calories: goal.dailyCalorieTarget,
          protein: goal.proteinG,
          carbs: goal.carbsG,
          fat: goal.fatG,
        }
      : null,
    remaining: goal
      ? {
          calories: (goal.dailyCalorieTarget || 0) - totals.calories,
          protein: (goal.proteinG || 0) - totals.protein,
          carbs: (goal.carbsG || 0) - totals.carbs,
          fat: (goal.fatG || 0) - totals.fat,
        }
      : null,
    recentWeights,
  });
}
