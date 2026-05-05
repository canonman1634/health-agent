import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { foodInventory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const result = await db
    .select()
    .from(foodInventory)
    .where(eq(foodInventory.userId, 1))
    .orderBy(desc(foodInventory.analyzedAt))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ items: [], analyzedAt: null });
  }
  return NextResponse.json(result[0]);
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  const body = await request.json();
  const result = await db
    .insert(foodInventory)
    .values({
      userId: 1,
      items: body.items || [],
      sourceDescription: body.sourceDescription || null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}
