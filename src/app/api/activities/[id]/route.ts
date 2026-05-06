import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkApiAuth(request)) return unauthorizedResponse();
  const body = await request.json();
  const result = await db
    .update(activities)
    .set({
      ...(body.activityType !== undefined && { activityType: body.activityType }),
      ...(body.durationMinutes !== undefined && { durationMinutes: body.durationMinutes }),
      ...(body.caloriesBurned !== undefined && { caloriesBurned: body.caloriesBurned }),
      ...(body.description !== undefined && { description: body.description }),
    })
    .where(eq(activities.id, parseInt(params.id)))
    .returning();
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkApiAuth(request)) return unauthorizedResponse();
  const result = await db
    .delete(activities)
    .where(eq(activities.id, parseInt(params.id)))
    .returning();
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
