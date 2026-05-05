import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medicalProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const result = await db
    .select()
    .from(medicalProfiles)
    .where(eq(medicalProfiles.userId, 1))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({
      conditions: [],
      allergies: [],
      medications: [],
      notes: "",
    });
  }
  return NextResponse.json(result[0]);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();

  const existing = await db
    .select()
    .from(medicalProfiles)
    .where(eq(medicalProfiles.userId, 1))
    .limit(1);

  let result;
  if (existing.length > 0) {
    result = await db
      .update(medicalProfiles)
      .set({
        conditions: body.conditions || [],
        allergies: body.allergies || [],
        medications: body.medications || [],
        notes: body.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(medicalProfiles.userId, 1))
      .returning();
  } else {
    result = await db
      .insert(medicalProfiles)
      .values({
        userId: 1,
        conditions: body.conditions || [],
        allergies: body.allergies || [],
        medications: body.medications || [],
        notes: body.notes || null,
      })
      .returning();
  }

  return NextResponse.json(result[0]);
}
