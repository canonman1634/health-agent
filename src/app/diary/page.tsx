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
  const [loading, setLoading] = useState(true);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  // Meal form
  const [mealDesc, setMealDesc] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [mealCals, setMealCals] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");
  const [mealSugar, setMealSugar] = useState("");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Activity form
  const [activityType, setActivityType] = useState("");
  const [activityDuration, setActivityDuration] = useState("");
  const [activityCals, setActivityCals] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [mealsRes, activitiesRes] = await Promise.all([
        fetch("/api/meals"),
        fetch("/api/activities"),
      ]);
      setMeals(await mealsRes.json());
      setActivities(await activitiesRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openEditMeal(meal: Meal) {
    setEditingMeal(meal);
    setMealDesc(meal.description);
    setMealType(meal.mealType);
    setMealCals(meal.calories?.toString() ?? "");
    setMealProtein(meal.proteinG?.toString() ?? "");
    setMealCarbs(meal.carbsG?.toString() ?? "");
    setMealFat(meal.fatG?.toString() ?? "");
    setMealSugar(meal.sugarG?.toString() ?? "");
    setShowMealForm(true);
    setShowActivityForm(false);
  }

  function openNewMeal() {
    setEditingMeal(null);
    setMealDesc(""); setMealType("snack"); setMealCals("");
    setMealProtein(""); setMealCarbs(""); setMealFat(""); setMealSugar("");
    setShowMealForm(!showMealForm);
    setShowActivityForm(false);
  }

  function openEditActivity(a: Activity) {
    setEditingActivity(a);
    setActivityType(a.activityType);
    setActivityDuration(a.durationMinutes?.toString() ?? "");
    setActivityCals(a.caloriesBurned?.toString() ?? "");
    setActivityDesc(a.description ?? "");
    setShowActivityForm(true);
    setShowMealForm(false);
  }

  function openNewActivity() {
    setEditingActivity(null);
    setActivityType(""); setActivityDuration(""); setActivityCals(""); setActivityDesc("");
    setShowActivityForm(!showActivityForm);
    setShowMealForm(false);
  }

  async function saveMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!mealDesc.trim()) return;
    const payload = {
      description: mealDesc,
      mealType,
      calories: mealCals ? parseInt(mealCals) : null,
      proteinG: mealProtein ? parseFloat(mealProtein) : null,
      carbsG: mealCarbs ? parseFloat(mealCarbs) : null,
      fatG: mealFat ? parseFloat(mealFat) : null,
      sugarG: mealSugar ? parseFloat(mealSugar) : null,
      aiAnalyzed: !!(mealCals || mealProtein),
    };
    if (editingMeal) {
      await fetch(`/api/meals/${editingMeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowMealForm(false);
    setEditingMeal(null);
    loadData();
  }

  async function saveActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!activityType.trim()) return;
    const payload = {
      activityType,
      durationMinutes: activityDuration ? parseInt(activityDuration) : null,
      caloriesBurned: activityCals ? parseInt(activityCals) : null,
      description: activityDesc || null,
    };
    if (editingActivity) {
      await fetch(`/api/activities/${editingActivity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowActivityForm(false);
    setEditingActivity(null);
    loadData();
  }

  async function deleteMeal(id: number) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    loadData();
  }

  async function deleteActivity(id: number) {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) {
    return (
      <div className="p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-32 mb-6" />
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diary</h1>
        <div className="flex gap-2">
          <button onClick={openNewMeal} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + Meal
          </button>
          <button onClick={openNewActivity} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
            + Activity
          </button>
        </div>
      </div>

      {showMealForm && (
        <form onSubmit={saveMeal} className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800">
          <p className="text-sm font-medium text-gray-300">{editingMeal ? "Edit Meal" : "Log Meal"}</p>
          <input
            type="text" value={mealDesc} onChange={e => setMealDesc(e.target.value)}
            placeholder="What did you eat? e.g. turkey sandwich with mayo"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map(type => (
              <button key={type} type="button" onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${mealType === type ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Calories", value: mealCals, set: setMealCals },
              { label: "Protein (g)", value: mealProtein, set: setMealProtein },
              { label: "Carbs (g)", value: mealCarbs, set: setMealCarbs },
              { label: "Fat (g)", value: mealFat, set: setMealFat },
              { label: "Sugar (g)", value: mealSugar, set: setMealSugar },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-gray-500 mb-0.5 block">{f.label}</label>
                <input type="number" value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder="—"
                  className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">Nutrition optional — Claude will estimate it for you</p>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors">
              {editingMeal ? "Save Changes" : "Log Meal"}
            </button>
            <button type="button" onClick={() => { setShowMealForm(false); setEditingMeal(null); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showActivityForm && (
        <form onSubmit={saveActivity} className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800">
          <p className="text-sm font-medium text-gray-300">{editingActivity ? "Edit Activity" : "Log Activity"}</p>
          <input type="text" value={activityType} onChange={e => setActivityType(e.target.value)}
            placeholder="Activity type (e.g. walking, weights, cycling)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Duration (min)</label>
              <input type="number" value={activityDuration} onChange={e => setActivityDuration(e.target.value)}
                placeholder="—"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Calories burned</label>
              <input type="number" value={activityCals} onChange={e => setActivityCals(e.target.value)}
                placeholder="—"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
            </div>
          </div>
          <input type="text" value={activityDesc} onChange={e => setActivityDesc(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium transition-colors">
              {editingActivity ? "Save Changes" : "Log Activity"}
            </button>
            <button type="button" onClick={() => { setShowActivityForm(false); setEditingActivity(null); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {meals.length === 0 && activities.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No entries today</p>
            <p className="text-gray-600 text-sm mt-1">Tap &quot;+ Meal&quot; to log your first meal</p>
          </div>
        ) : (
          <>
            {meals.map(meal => (
              <div key={meal.id} className="bg-gray-900 rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium capitalize text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{meal.mealType}</span>
                      {!meal.aiAnalyzed && <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">pending analysis</span>}
                    </div>
                    <p className="text-sm text-gray-200">{meal.description}</p>
                    {meal.calories && (
                      <p className="text-xs text-gray-500 mt-1">
                        {meal.calories} cal · {meal.proteinG}g P · {meal.carbsG}g C · {meal.fatG}g F
                        {meal.sugarG ? ` · ${meal.sugarG}g sugar` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => openEditMeal(meal)} className="text-gray-500 hover:text-blue-400 p-1 text-sm">✏️</button>
                    <button onClick={() => deleteMeal(meal.id)} className="text-gray-500 hover:text-red-400 p-1 text-sm">✕</button>
                  </div>
                </div>
              </div>
            ))}

            {activities.map(activity => (
              <div key={activity.id} className="bg-gray-900 rounded-xl p-3 border-l-2 border-green-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{activity.activityType}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.durationMinutes ? `${activity.durationMinutes} min` : ""}
                      {activity.durationMinutes && activity.caloriesBurned ? " · " : ""}
                      {activity.caloriesBurned ? `${activity.caloriesBurned} cal burned` : ""}
                      {activity.description ? ` · ${activity.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => openEditActivity(activity)} className="text-gray-500 hover:text-blue-400 p-1 text-sm">✏️</button>
                    <button onClick={() => deleteActivity(activity.id)} className="text-gray-500 hover:text-red-400 p-1 text-sm">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
