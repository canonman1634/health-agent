"use client";

import { useEffect, useState } from "react";

interface MedicalProfile {
  conditions: string[];
  allergies: string[];
  medications: string[];
  notes: string;
}

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (idx: number) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  }

  return (
    <div>
      <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-lg"
          >
            {tag}
            <button
              onClick={() => onRemove(idx)}
              className="text-gray-500 hover:text-red-400"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );
}

export default function MedicalPage() {
  const [profile, setProfile] = useState<MedicalProfile>({
    conditions: [],
    allergies: [],
    medications: [],
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/medical")
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          conditions: data.conditions || [],
          allergies: data.allergies || [],
          medications: data.medications || [],
          notes: data.notes || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/medical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-32 mb-6" />
        <div className="h-64 bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Medical Info</h1>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-5">
        <TagInput
          label="Conditions"
          tags={profile.conditions}
          onAdd={(tag) =>
            setProfile({ ...profile, conditions: [...profile.conditions, tag] })
          }
          onRemove={(idx) =>
            setProfile({
              ...profile,
              conditions: profile.conditions.filter((_, i) => i !== idx),
            })
          }
          placeholder="Type a condition and press Enter"
        />

        <TagInput
          label="Allergies"
          tags={profile.allergies}
          onAdd={(tag) =>
            setProfile({ ...profile, allergies: [...profile.allergies, tag] })
          }
          onRemove={(idx) =>
            setProfile({
              ...profile,
              allergies: profile.allergies.filter((_, i) => i !== idx),
            })
          }
          placeholder="Type an allergy and press Enter"
        />

        <TagInput
          label="Medications"
          tags={profile.medications}
          onAdd={(tag) =>
            setProfile({
              ...profile,
              medications: [...profile.medications, tag],
            })
          }
          onRemove={(idx) =>
            setProfile({
              ...profile,
              medications: profile.medications.filter((_, i) => i !== idx),
            })
          }
          placeholder="Type a medication and press Enter"
        />

        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Notes</label>
          <textarea
            value={profile.notes}
            onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
            placeholder="Any other health notes..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <p className="text-gray-600 text-xs text-center mt-4">
        This info is shared with your AI health coach for safety-aware
        suggestions.
      </p>
    </div>
  );
}
