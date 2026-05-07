import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const result = await db
    .update(meals)
    .set({
      ...(body.description !== undefined && { description: body.description }),
      ...(body.mealType !== undefined && { mealType: body.mealType }),
      ...(body.calories !== undefined && { calories: body.calories }),
      ...(body.proteinG !== undefined && { proteinG: body.proteinG }),
      ...(body.carbsG !== undefined && { carbsG: body.carbsG }),
      ...(body.fatG !== undefined && { fatG: body.fatG }),
      ...(body.sugarG !== undefined && { sugarG: body.sugarG }),
      ...(body.fiberG !== undefined && { fiberG: body.fiberG }),
      ...(body.aiAnalyzed !== undefined && { aiAnalyzed: body.aiAnalyzed }),
      ...(body.recordedAt !== undefined && { recordedAt: new Date(body.recordedAt) }),
    })
    .where(eq(meals.id, parseInt(params.id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const result = await db
    .delete(meals)
    .where(eq(meals.id, parseInt(params.id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
