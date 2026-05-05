"use client";

import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-4 pt-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-1">About</h2>
          <p className="text-sm text-gray-300">
            Health Agent is your personal health coaching dashboard. Log meals,
            track weight, and chat with your AI coach via Claude Code.
          </p>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <h2 className="text-sm font-medium text-gray-400 mb-1">
            API Access
          </h2>
          <p className="text-xs text-gray-500">
            Use your API token in Claude Code to read/write health data.
            Set API_TOKEN environment variable on Railway.
          </p>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-medium transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
