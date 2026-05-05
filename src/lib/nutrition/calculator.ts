export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

interface TDEEInput {
  weightLbs: number;
  heightInches?: number;
  age?: number;
  sex?: "male" | "female";
  activityLevel: ActivityLevel;
}

interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function calculateTDEE(input: TDEEInput): number {
  const weightKg = input.weightLbs * 0.453592;
  const heightCm = (input.heightInches ?? 70) * 2.54;
  const age = input.age ?? 30;

  // Mifflin-St Jeor
  let bmr: number;
  if (input.sex === "female") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  return Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]);
}

export function calculateMacroTargets(
  tdee: number,
  targetWeightLbs: number,
  deficit: number
): MacroTargets {
  const calories = Math.max(1200, tdee - deficit);

  // Protein: 1g per lb of target body weight
  const proteinG = Math.round(targetWeightLbs);
  const proteinCals = proteinG * 4;

  // Fat: 25% of remaining calories
  const remainingCals = calories - proteinCals;
  const fatCals = Math.round(remainingCals * 0.25);
  const fatG = Math.round(fatCals / 9);

  // Carbs: whatever's left
  const carbsCals = calories - proteinCals - fatCals;
  const carbsG = Math.round(carbsCals / 4);

  return { calories, proteinG, carbsG, fatG };
}

export function calculateDailyDeficit(
  currentWeight: number,
  targetWeight: number,
  daysRemaining: number
): { deficit: number; safetyWarning: string | null } {
  const lbsToLose = currentWeight - targetWeight;
  if (lbsToLose <= 0) {
    return { deficit: 0, safetyWarning: null };
  }

  // 3500 cal ≈ 1 lb
  const totalDeficit = lbsToLose * 3500;
  const dailyDeficit = Math.round(totalDeficit / daysRemaining);

  let safetyWarning: string | null = null;

  if (dailyDeficit > 1500) {
    safetyWarning =
      "This goal requires an extreme deficit. Consider extending your timeline for safer, sustainable results.";
  } else if (dailyDeficit > 1000) {
    safetyWarning =
      "This is an aggressive deficit. You may experience fatigue and muscle loss. A more moderate approach is recommended.";
  }

  // Cap at 1000 cal/day deficit for safety
  const safeDeficit = Math.min(dailyDeficit, 1000);

  return { deficit: safeDeficit, safetyWarning };
}

export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
