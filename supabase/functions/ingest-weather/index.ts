// KIRAN — supabase/functions/ingest-weather/index.ts
// Deno Edge Function. Run on a schedule (see README Step 6) to keep
// thermal_index fresh for every monitored location.
//
// IMPORTANT: calculateThermalStress() below must stay logically identical
// to backend/thermal_index.py and lib/thermalIndex.ts — same formula,
// same thresholds, everywhere. This is the copy that actually runs in
// production and writes the numbers everyone else just displays.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type RiskCategory = "Low" | "Moderate" | "High" | "Extreme";
const INDIA_HUMIDITY_TOLERANCE_OFFSET = 0.92;

function toF(c: number) { return (c * 9) / 5 + 32; }
function toC(f: number) { return ((f - 32) * 5) / 9; }

function calculateThermalStress(tempC: number, rh: number, windKmh = 0) {
  const T = toF(tempC);
  const R = rh * INDIA_HUMIDITY_TOLERANCE_OFFSET;

  let hiF: number;
  if (T < 80) {
    hiF = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);
  } else {
    hiF =
      -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R -
      0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R +
      0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
  }
  if (windKmh > 8) hiF -= Math.min((windKmh - 8) * 0.05, 3);

  const heatIndexC = Math.round(toC(hiF) * 10) / 10;

  let score: number;
  if (heatIndexC <= 30) score = Math.max(0, (heatIndexC / 30) * 40);
  else if (heatIndexC <= 38) score = 40 + ((heatIndexC - 30) / 8) * 20;
  else if (heatIndexC <= 45) score = 60 + ((heatIndexC - 38) / 7) * 20;
  else score = Math.min(100, 80 + ((heatIndexC - 45) / 5) * 20);
  score = Math.round(score * 10) / 10;

  let category: RiskCategory, ndmaTier: "Yellow" | "Orange" | "Red";
  if (score < 40) { category = "Low"; ndmaTier = "Yellow"; }
  else if (score < 60) { category = "Moderate"; ndmaTier = "Yellow"; }
  else if (score < 80) { category = "High"; ndmaTier = "Orange"; }
  else { category = "Extreme"; ndmaTier = "Red"; }

  return { score, heatIndexC, category, ndmaTier };
}

async function fetchWeather(lat: number, lng: number) {
  // Open-Meteo — free, no API key needed. Swap for IMD-grade source if you get access.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo failed: ${res.status}`);
  const data = await res.json();
  return {
    tempC: data.current.temperature_2m as number,
    rh: data.current.relative_humidity_2m as number,
    windKmh: data.current.wind_speed_10m as number,
  };
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: locations, error: locErr } = await supabase
    .from("locations")
    .select("id, lat, lng");
  if (locErr) return new Response(JSON.stringify({ error: locErr.message }), { status: 500 });

  const results = [];
  for (const loc of locations ?? []) {
    try {
      const weather = await fetchWeather(loc.lat, loc.lng);
      const tsi = calculateThermalStress(weather.tempC, weather.rh, weather.windKmh);

      const { error: insertErr } = await supabase.from("thermal_index").insert({
        location_id: loc.id,
        temp_c: weather.tempC,
        rh: weather.rh,
        wind_kmh: weather.windKmh,
        score: tsi.score,
        heat_index_c: tsi.heatIndexC,
        category: tsi.category,
        ndma_tier: tsi.ndmaTier,
      });
      if (insertErr) throw insertErr;
      results.push({ location_id: loc.id, category: tsi.category, ok: true });
    } catch (e) {
      results.push({ location_id: loc.id, ok: false, error: String(e) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
