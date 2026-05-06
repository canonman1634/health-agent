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
  const [editingWeight, setEditingWeight] = useState<WeightLog | null>(null);

  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");

  const [newWeight, setNewWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [goalRes, weightsRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/weight?days=30"),
      ]);
      setGoal(await goalRes.json());
      setWeights(await weightsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openEditGoal() {
    setShowGoalForm(true);
    if (goal) {
      setCurrentWeight(goal.currentWeight.toString());
      setTargetWeight(goal.targetWeight.toString());
      setTargetDate(goal.targetDate);
      setActivityLevel(goal.activityLevel);
    } else {
      setCurrentWeight(""); setTargetWeight(""); setTargetDate(""); setActivityLevel("moderate");
    }
  }

  function openEditWeight(w: WeightLog) {
    setEditingWeight(w);
    setNewWeight(w.weight.toString());
    setWeightNotes(w.notes ?? "");
    setShowWeightForm(true);
  }

  function openNewWeight() {
    setEditingWeight(null);
    setNewWeight(""); setWeightNotes("");
    setShowWeightForm(!showWeightForm);
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
    setShowGoalForm(false);
    loadData();
  }

  async function saveWeight(e: React.FormEvent) {
    e.preventDefault();
    if (editingWeight) {
      await fetch(`/api/weight/${editingWeight.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(newWeight), notes: weightNotes || null }),
      });
    } else {
      await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(newWeight), notes: weightNotes || null }),
      });
    }
    setNewWeight(""); setWeightNotes("");
    setShowWeightForm(false);
    setEditingWeight(null);
    loadData();
  }

  async function deleteWeight(id: number) {
    await fetch(`/api/weight/${id}`, { method: "DELETE" });
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
          <button onClick={openNewWeight} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + Weight
          </button>
          <button onClick={openEditGoal} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
            {goal ? "Edit Goal" : "Set Goal"}
          </button>
        </div>
      </div>

      {showWeightForm && (
        <form onSubmit={saveWeight} className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800">
          <p className="text-sm font-medium text-gray-300">{editingWeight ? "Edit Weight Entry" : "Log Weight"}</p>
          <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus required />
          <input type="text" value={weightNotes} onChange={e => setWeightNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors">
              {editingWeight ? "Save Changes" : "Log Weight"}
            </button>
            <button type="button" onClick={() => { setShowWeightForm(false); setEditingWeight(null); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showGoalForm && (
        <form onSubmit={saveGoal} className="bg-gray-900 rounded-2xl p-4 mb-4 space-y-3 border border-gray-800">
          <p className="text-sm font-medium text-gray-300">{goal ? "Edit Goal" : "Set Goal"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Current Weight (lbs)</label>
              <input type="number" step="0.1" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Target Weight (lbs)</label>
              <input type="number" step="0.1" value={targetWeight} onChange={e => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Activity Level</label>
            <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="sedentary">Sedentary (desk job, no exercise)</option>
              <option value="light">Light (1-2 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (athlete/physical job)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors">
              Save Goal
            </button>
            <button type="button" onClick={() => setShowGoalForm(false)}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {goal && !showGoalForm && (
        <div className="bg-gray-900 rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Current Goal</h2>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-2xl font-bold">{goal.currentWeight}</p>
              <p className="text-xs text-gray-500">Current (lbs)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{goal.targetWeight}</p>
              <p className="text-xs text-gray-500">Target (lbs)</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Target: {new Date(goal.targetDate + "T00:00:00").toLocaleDateString()}</p>
          <p className="text-xs text-gray-500 capitalize mb-3">Activity: {goal.activityLevel.replace("_", " ")}</p>
          <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-gray-800">
            <div><p className="text-sm font-bold">{goal.dailyCalorieTarget}</p><p className="text-xs text-gray-500">cal</p></div>
            <div><p className="text-sm font-bold">{goal.proteinG}g</p><p className="text-xs text-gray-500">protein</p></div>
            <div><p className="text-sm font-bold">{goal.carbsG}g</p><p className="text-xs text-gray-500">carbs</p></div>
            <div><p className="text-sm font-bold">{goal.fatG}g</p><p className="text-xs text-gray-500">fat</p></div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Weight History</h2>
        {weights.length === 0 ? (
          <p className="text-gray-600 text-sm">No weigh-ins recorded</p>
        ) : (
          <div className="space-y-2">
            {weights.map(w => (
              <div key={w.id} className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-200">{w.weight} lbs</span>
                  {w.notes && <span className="text-xs text-gray-500 ml-2">{w.notes}</span>}
                  <p className="text-xs text-gray-600">{new Date(w.recordedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditWeight(w)} className="text-gray-500 hover:text-blue-400 p-1 text-sm">✏️</button>
                  <button onClick={() => deleteWeight(w.id)} className="text-gray-500 hover:text-red-400 p-1 text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
