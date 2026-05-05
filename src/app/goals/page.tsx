"use client";

import { useEffect, useState } from "react";

interface Goal {
  id: number;
  currentWeight: number;
  targetWeight: number;
  targetDate: string;
  activityLevel: string;
  dailyCalorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface WeightLog {
  id: number;
  weight: number;
  recordedAt: string;
  notes: string | null;
}

export default function GoalsPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);

  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");

  const [newWeight, setNewWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [goalRes, weightsRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/weight?days=30"),
      ]);
      const goalData = await goalRes.json();
      setGoal(goalData);
      setWeights(await weightsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        targetDate,
        activityLevel,
      }),
    });
    const data = await res.json();
    if (data.safetyWarning) {
      setSafetyWarning(data.safetyWarning);
    }
    setShowGoalForm(false);
    loadData();
  }

  async function logWeight(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: parseFloat(newWeight),
        notes: weightNotes || null,
      }),
    });
    setNewWeight("");
    setWeightNotes("");
    setShowWeightForm(false);
    loadData();
  }

  if (loading) {
    return (
      <div className="p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-32 mb-6" />
        <div className="h-48 bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Goals</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            + Weight
          </button>
          <button
            onClick={() => {
              setShowGoalForm(!showGoalForm);
              if (goal) {
                setCurrentWeight(goal.currentWeight.toString());
                setTargetWeight(goal.targetWeight.toString());
                setTargetDate(goal.targetDate);
                setActivityLevel(goal.activityLevel);
              }
            }}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            {goal ? "Edit Goal" : "Set Goal"}
          </button>
        </div>
      </div>

      {safetyWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-400 text-sm">⚠️ {safetyWarning}</p>
        </div>
      )}

      {showWeightForm && (
        <form
          onSubmit={logWeight}
          className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800"
        >
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
          <input
            type="text"
            value={weightNotes}
            onChange={(e) => setWeightNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors"
          >
            Log Weight
          </button>
        </form>
      )}

      {showGoalForm && (
        <form
          onSubmit={saveGoal}
          className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Current Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary (desk job, no exercise)</option>
              <option value="light">Light (1-2 days/week exercise)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (athlete/physical job)</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors"
          >
            Save Goal
          </button>
        </form>
      )}

      {goal && (
        <div className="bg-gray-900 rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            Current Goal
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">{goal.currentWeight}</p>
              <p className="text-xs text-gray-500">Current (lbs)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {goal.targetWeight}
              </p>
              <p className="text-xs text-gray-500">Target (lbs)</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Target date: {new Date(goal.targetDate + 'T00:00:00').toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              Activity: {goal.activityLevel.replace("_", " ")}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-sm font-bold">{goal.dailyCalorieTarget}</p>
              <p className="text-xs text-gray-500">cal</p>
            </div>
            <div>
              <p className="text-sm font-bold">{goal.proteinG}g</p>
              <p className="text-xs text-gray-500">protein</p>
            </div>
            <div>
              <p className="text-sm font-bold">{goal.carbsG}g</p>
              <p className="text-xs text-gray-500">carbs</p>
            </div>
            <div>
              <p className="text-sm font-bold">{goal.fatG}g</p>
              <p className="text-xs text-gray-500">fat</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          Weight History
        </h2>
        {weights.length === 0 ? (
          <p className="text-gray-600 text-sm">No weigh-ins recorded</p>
        ) : (
          <div className="space-y-2">
            {weights.map((w) => (
              <div
                key={w.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">{w.weight} lbs</span>
                <span className="text-gray-500">
                  {new Date(w.recordedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
