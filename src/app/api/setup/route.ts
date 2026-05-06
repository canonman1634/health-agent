import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { checkApiAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();
  const url = process.env.DATABASE_URL || "NOT SET";
  const masked = url.replace(/:([^@]+)@/, ":***@").slice(0, 60);
  return NextResponse.json({ dbUrl: masked, nodeEnv: process.env.NODE_ENV });
}

export async function POST(request: NextRequest) {
  if (!checkApiAuth(request)) return unauthorizedResponse();

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        current_weight REAL NOT NULL,
        target_weight REAL NOT NULL,
        target_date DATE NOT NULL,
        activity_level TEXT NOT NULL DEFAULT 'moderate',
        daily_calorie_target INTEGER,
        protein_g INTEGER,
        carbs_g INTEGER,
        fat_g INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        weight REAL NOT NULL,
        recorded_at TIMESTAMP DEFAULT NOW() NOT NULL,
        notes TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        meal_type TEXT NOT NULL DEFAULT 'snack',
        description TEXT NOT NULL,
        calories INTEGER,
        protein_g REAL,
        carbs_g REAL,
        fat_g REAL,
        sugar_g REAL,
        fiber_g REAL,
        ai_analyzed BOOLEAN NOT NULL DEFAULT FALSE,
        recorded_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        activity_type TEXT NOT NULL,
        duration_minutes INTEGER,
        calories_burned INTEGER,
        description TEXT,
        recorded_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        total_calories INTEGER,
        total_protein REAL,
        total_carbs REAL,
        total_fat REAL,
        total_sugar REAL,
        calories_burned INTEGER,
        net_calories INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medical_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        conditions JSONB DEFAULT '[]',
        allergies JSONB DEFAULT '[]',
        medications JSONB DEFAULT '[]',
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS food_inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        items JSONB DEFAULT '[]',
        source_description TEXT,
        analyzed_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Seed user if not exists
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE id = 1`
    );
    if (existing.rows.length === 0) {
      await db.execute(
        sql`INSERT INTO users (id, name) VALUES (1, 'Jason')`
      );
    }

    return NextResponse.json({
      success: true,
      message: "All tables created and user seeded.",
    });
  } catch (err) {
    const e = err as any;
    return NextResponse.json(
      { error: String(err), message: e?.message, code: e?.code, detail: e?.errors?.map?.((x: any) => x.message) },
      { status: 500 }
    );
  }
}
