"use client";

import { useEffect, useState } from "react";

interface Meal {
  id: number;
  mealType: string;
  description: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  sugarG: number | null;
  aiAnalyzed: boolean;
  recordedAt: string;
}

interface Activity {
  id: number;
  activityType: string;
  durationMinutes: number | null;
  caloriesBurned: number | null;
  description: string | null;
  recordedAt: string;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function DiaryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [mealDesc, setMealDesc] = useState("");
  const [mealType, setMealType] = useState("snack");

  const [activityType, setActivityType] = useState("");
  const [activityDuration, setActivityDuration] = useState("");
  const [activityCals, setActivityCals] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [mealsRes, activitiesRes] = await Promise.all([
        fetch("/api/meals"),
        fetch("/api/activities"),
      ]);
      setMeals(await mealsRes.json());
      setActivities(await activitiesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!mealDesc.trim()) return;

    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: mealDesc, mealType }),
    });

    setMealDesc("");
    setMealType("snack");
    setShowMealForm(false);
    loadData();
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityType.trim()) return;

    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType,
        durationMinutes: activityDuration ? parseInt(activityDuration) : null,
        caloriesBurned: activityCals ? parseInt(activityCals) : null,
      }),
    });

    setActivityType("");
    setActivityDuration("");
    setActivityCals("");
    setShowActivityForm(false);
    loadData();
  }

  async function deleteMeal(id: number) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) {
    return (
      <div className="p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diary</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowMealForm(!showMealForm);
              setShowActivityForm(false);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            + Meal
          </button>
          <button
            onClick={() => {
              setShowActivityForm(!showActivityForm);
              setShowMealForm(false);
            }}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            + Activity
          </button>
        </div>
      </div>

      {showMealForm && (
        <form
          onSubmit={addMeal}
          className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800"
        >
          <input
            type="text"
            value={mealDesc}
            onChange={(e) => setMealDesc(e.target.value)}
            placeholder="What did you eat? e.g. turkey sandwich with mayo"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  mealType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors"
          >
            Log Meal
          </button>
        </form>
      )}

      {showActivityForm && (
        <form
          onSubmit={addActivity}
          className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800"
        >
          <input
            type="text"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            placeholder="Activity type (e.g. walking, weights)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={activityDuration}
              onChange={(e) => setActivityDuration(e.target.value)}
              placeholder="Minutes"
              className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              type="number"
              value={activityCals}
              onChange={(e) => setActivityCals(e.target.value)}
              placeholder="Calories burned"
              className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium transition-colors"
          >
            Log Activity
          </button>
        </form>
      )}

      <div className="space-y-3">
        {meals.length === 0 && activities.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No entries today</p>
            <p className="text-gray-600 text-sm mt-1">
              Tap &quot;+ Meal&quot; to log your first meal
            </p>
          </div>
        ) : (
          <>
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-gray-900 rounded-xl p-3 flex justify-between items-start"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium capitalize text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {meal.mealType}
                    </span>
                    {!meal.aiAnalyzed && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                        pending analysis
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200 truncate">
                    {meal.description}
                  </p>
                  {meal.calories && (
                    <p className="text-xs text-gray-500 mt-1">
                      {meal.calories} cal • {meal.proteinG}g P •{" "}
                      {meal.carbsG}g C • {meal.fatG}g F
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="text-gray-600 hover:text-red-400 ml-2 text-sm p-1"
                >
                  ✕
                </button>
              </div>
            ))}

            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-gray-900 rounded-xl p-3 border-l-2 border-green-600"
              >
                <p className="text-sm text-gray-200">{activity.activityType}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.durationMinutes && `${activity.durationMinutes} min`}
                  {activity.caloriesBurned &&
                    ` • ${activity.caloriesBurned} cal burned`}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
