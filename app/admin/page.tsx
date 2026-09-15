"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { riskColor, RiskCategory } from "@/lib/thermalIndex";

interface AdminLocation {
  id: string;
  name: string;
  state: string;
  latest_category: RiskCategory | null;
  latest_score: number | null;
}

interface AlertLogRow {
  id: string;
  sent_at: string;
  category: string;
  channel: string;
  status: string;
  triggered_by: string;
  location_name: string;
}

export default function AdminPortalPage() {
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [jurisdiction, setJurisdiction] = useState<string | null>(null);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [alertLog, setAlertLog] = useState<AlertLogRow[]>([]);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("jurisdiction")
        .eq("user_id", session.user.id)
        .single();
      const j = profile?.jurisdiction ?? "general";
      setJurisdiction(j);

      let locQuery = supabase.from("locations").select("id, name, state, jurisdiction");
      if (j !== "general") locQuery = locQuery.eq("jurisdiction", j);
      const { data: locs } = await locQuery;

      const withLatest: AdminLocation[] = [];
      for (const loc of locs ?? []) {
        const { data: latest } = await supabase
          .from("thermal_index")
          .select("category, score")
          .eq("location_id", loc.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();
        withLatest.push({
          id: loc.id,
          name: loc.name,
          state: loc.state,
          latest_category: (latest?.category as RiskCategory) ?? null,
          latest_score: latest?.score ?? null,
        });
      }
      setLocations(withLatest);

      const { data: log } = await supabase
        .from("alerts")
        .select("id, sent_at, category, channel, status, triggered_by, locations(name)")
        .order("sent_at", { ascending: false })
        .limit(30);
      setAlertLog(
        (log ?? []).map((r) => ({
          id: r.id,
          sent_at: r.sent_at,
          category: r.category,
          channel: r.channel,
          status: r.status,
          triggered_by: r.triggered_by,
          location_name: Array.isArray(r.locations) ? r.locations[0]?.name : (r.locations as any)?.name ?? "—",
        }))
      );
    })();
  }, [session]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

  async function triggerManualAlert(loc: AdminLocation) {
    if (!loc.latest_category) return;
    setBroadcasting(loc.id);
    try {
      await supabase.functions.invoke("send-alerts", {
        body: {
          record: {
            location_id: loc.id,
            category: loc.latest_category,
            ndma_tier: loc.latest_category === "Extreme" ? "Red" : "Orange",
          },
        },
      });
    } finally {
      setBroadcasting(null);
    }
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={handleLogin} className="glass w-full max-w-sm rounded-2xl p-6">
          <h1 className="mb-1 font-display text-xl font-semibold">Admin Portal</h1>
          <p className="mb-4 text-xs text-white/40">
            For local authorities. Create an account via Supabase Auth, then add a row to
            admin_profiles with your jurisdiction (see README Phase 2, Step 8).
          </p>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@authority.gov.in"
            className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder-white/30"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder-white/30"
          />
          {loginError && <p className="mb-3 text-xs text-risk-extreme">{loginError}</p>}
          <button type="submit" className="w-full rounded-lg bg-orange-500/80 py-2 text-sm font-medium hover:bg-orange-500">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Authority Dashboard</h1>
          <p className="text-xs text-white/40">Jurisdiction: {jurisdiction ?? "…"}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="glass rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white">
          Sign out
        </button>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Monitored Locations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.id} className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{loc.name}</span>
                {loc.latest_category && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{ color: riskColor[loc.latest_category], backgroundColor: `${riskColor[loc.latest_category]}22` }}
                  >
                    {loc.latest_category}
                  </span>
                )}
              </div>
              <p className="mb-3 text-xs text-white/40">{loc.state} · score {loc.latest_score ?? "—"}</p>
              <button
                onClick={() => triggerManualAlert(loc)}
                disabled={!loc.latest_category || broadcasting === loc.id}
                className="w-full rounded-lg border border-white/15 py-1.5 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
              >
                {broadcasting === loc.id ? "Broadcasting…" : "Trigger Alert Broadcast"}
              </button>
            </div>
          ))}
          {locations.length === 0 && (
            <p className="text-xs text-white/30">No locations found for this jurisdiction yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Alert Log</h2>
        <div className="glass overflow-hidden rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-white/40">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Trigger</th>
              </tr>
            </thead>
            <tbody>
              {alertLog.map((a) => (
                <tr key={a.id} className="border-b border-white/5 text-white/70">
                  <td className="px-3 py-2">{new Date(a.sent_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{a.location_name}</td>
                  <td className="px-3 py-2">{a.category}</td>
                  <td className="px-3 py-2">{a.channel}</td>
                  <td className="px-3 py-2">{a.status}</td>
                  <td className="px-3 py-2">{a.triggered_by}</td>
                </tr>
              ))}
              {alertLog.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-center text-white/30">No alerts sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
