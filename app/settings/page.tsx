"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

type Group = "General" | "Elderly" | "Outdoor Worker" | "Child" | "Pregnant";

const GROUPS: Group[] = ["General", "Elderly", "Outdoor Worker", "Child", "Pregnant"];

const GUIDANCE: Record<Group, string> = {
  General: "Standard thresholds apply. Avoid peak-sun hours (11am–4pm) once risk is High or above.",
  Elderly: "Lower threshold applied — flagged as High risk 5 points earlier than standard, since heat stress hits harder with age. Check in on elderly neighbors during Moderate risk too.",
  "Outdoor Worker": "Lower threshold applied — flagged as High risk 8 points earlier. Take shaded breaks every 30–45 minutes once Moderate risk is reached; hydrate before you feel thirsty.",
  Child: "Lower threshold applied — flagged as High risk 6 points earlier. Avoid outdoor play entirely once Moderate risk is reached; children dehydrate faster than adults.",
  Pregnant: "Lower threshold applied — flagged as High risk 6 points earlier. Prioritize shade and hydration; heat stress raises risk of complications.",
};

const STORAGE_KEY = "kiran:vulnerable-group";

export default function SettingsPage() {
  const [group, setGroup] = useState<Group>("General");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Group | null;
    if (saved && GROUPS.includes(saved)) setGroup(saved);
  }, []);

  function selectGroup(g: Group) {
    setGroup(g);
    window.localStorage.setItem(STORAGE_KEY, g);
  }

  return (
    <main className="min-h-screen px-4 pb-24 pt-24 font-body sm:pl-64 sm:pr-8">
      <Sidebar />
      <PageHeader title="Settings" subtitle="Personalize risk guidance for your situation." />

      <div className="glass mb-6 max-w-lg rounded-2xl p-5">
        <p className="mb-3 text-sm text-white/70">I'm checking for:</p>
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => selectGroup(g)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                group === g
                  ? "border-amber-400 bg-amber-400/10 text-amber-300"
                  : "border-white/15 text-white/50 hover:text-white/80"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="glass max-w-lg rounded-2xl p-5">
        <p className="mb-1 text-xs uppercase tracking-wide text-white/35">Guidance for: {group}</p>
        <p className="text-sm text-white/80">{GUIDANCE[group]}</p>
      </div>

      <p className="mt-6 max-w-lg text-xs text-white/30">
        Language (EN/हिं) and Low Data Mode toggles are in the top navbar. This selection is
        saved on this device only.
      </p>
    </main>
  );
}
