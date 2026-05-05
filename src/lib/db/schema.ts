import {
  pgTable,
  serial,
  text,
  timestamp,
  real,
  integer,
  boolean,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  currentWeight: real("current_weight").notNull(),
  targetWeight: real("target_weight").notNull(),
  targetDate: date("target_date").notNull(),
  activityLevel: text("activity_level").notNull().default("moderate"),
  dailyCalorieTarget: integer("daily_calorie_target"),
  proteinG: integer("protein_g"),
  carbsG: integer("carbs_g"),
  fatG: integer("fat_g"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const weightLogs = pgTable("weight_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  weight: real("weight").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  mealType: text("meal_type").notNull().default("snack"),
  description: text("description").notNull(),
  calories: integer("calories"),
  proteinG: real("protein_g"),
  carbsG: real("carbs_g"),
  fatG: real("fat_g"),
  sugarG: real("sugar_g"),
  fiberG: real("fiber_g"),
  aiAnalyzed: boolean("ai_analyzed").default(false).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  activityType: text("activity_type").notNull(),
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: integer("calories_burned"),
  description: text("description"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailySummaries = pgTable("daily_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  date: date("date").notNull(),
  totalCalories: integer("total_calories"),
  totalProtein: real("total_protein"),
  totalCarbs: real("total_carbs"),
  totalFat: real("total_fat"),
  totalSugar: real("total_sugar"),
  caloriesBurned: integer("calories_burned"),
  netCalories: integer("net_calories"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicalProfiles = pgTable("medical_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  conditions: jsonb("conditions").$type<string[]>().default([]),
  allergies: jsonb("allergies").$type<string[]>().default([]),
  medications: jsonb("medications").$type<string[]>().default([]),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const foodInventory = pgTable("food_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  items: jsonb("items")
    .$type<{ name: string; quantity?: string; category?: string }[]>()
    .default([]),
  sourceDescription: text("source_description"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
