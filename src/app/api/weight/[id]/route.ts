import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weightLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkApiAuth(request)) return unauthorizedResponse();
  const body = await request.json();
  const result = await db
    .update(weightLogs)
    .set({
      ...(body.weight !== undefined && { weight: body.weight }),
      ...(body.notes !== undefined && { notes: body.notes }),
    })
    .where(eq(weightLogs.id, parseInt(params.id)))
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
    .delete(weightLogs)
    .where(eq(weightLogs.id, parseInt(params.id)))
    .returning();
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
