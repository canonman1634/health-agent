"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Summary {
  date: string;
  meals: Array<{ id: number; description: string; mealType: string }>;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
  caloriesBurned: number;
  netCalories: number;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  recentWeights: Array<{ weight: number; recordedAt: string }>;
}

function ProgressBar({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={over ? "text-red-400" : "text-gray-300"}>
          {Math.round(current)} / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
    const offset = new Date().getTimezoneOffset();
    fetch(`/api/summary?date=${today}&offset=${offset}`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const targets = summary?.targets;
  const totals = summary?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
  };

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Today</h1>
      <p className="text-gray-500 text-sm mb-6">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      {!targets ? (
        <Link
          href="/goals"
          className="block bg-gray-900 rounded-2xl p-6 text-center border border-gray-800 mb-6"
        >
          <p className="text-gray-400 mb-2">No goals set yet</p>
          <p className="text-blue-400 font-medium">Set up your goals →</p>
        </Link>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3 mb-6">
          <ProgressBar
            label="Calories"
            current={totals.calories}
            target={targets.calories}
            unit="cal"
            color="bg-blue-500"
          />
          <ProgressBar
            label="Protein"
            current={totals.protein}
            target={targets.protein}
            unit="g"
            color="bg-green-500"
          />
          <ProgressBar
            label="Carbs"
            current={totals.carbs}
            target={targets.carbs}
            unit="g"
            color="bg-yellow-500"
          />
          <ProgressBar
            label="Fat"
            current={totals.fat}
            target={targets.fat}
            unit="g"
            color="bg-purple-500"
          />
        </div>
      )}

      {summary?.remaining && targets && (
        <div className="bg-gray-900 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Remaining</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p
                className={`text-lg font-bold ${summary.remaining.calories < 0 ? "text-red-400" : "text-white"}`}
              >
                {Math.round(summary.remaining.calories)}
              </p>
              <p className="text-xs text-gray-500">cal</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {Math.round(summary.remaining.protein)}
              </p>
              <p className="text-xs text-gray-500">protein</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {Math.round(summary.remaining.carbs)}
              </p>
              <p className="text-xs text-gray-500">carbs</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {Math.round(summary.remaining.fat)}
              </p>
              <p className="text-xs text-gray-500">fat</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-400">
            Today&apos;s Meals
          </h2>
          <span className="text-sm text-gray-500">
            {summary?.meals.length || 0} logged
          </span>
        </div>
        {summary?.meals.length === 0 ? (
          <p className="text-gray-600 text-sm">No meals logged yet</p>
        ) : (
          <div className="space-y-2">
            {summary?.meals.slice(0, 5).map((meal) => (
              <div
                key={meal.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">{meal.description}</span>
                <span className="text-gray-500 capitalize text-xs">
                  {meal.mealType}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/diary"
          className="block mt-3 text-center text-blue-400 text-sm font-medium"
        >
          View diary →
        </Link>
      </div>

      {summary?.recentWeights && summary.recentWeights.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-2">
            Latest Weight
          </h2>
          <p className="text-3xl font-bold">
            {summary.recentWeights[0].weight}
            <span className="text-lg text-gray-500 ml-1">lbs</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(summary.recentWeights[0].recordedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
