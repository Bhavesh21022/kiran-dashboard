import { supabase } from "./supabaseClient";
import { RiskCategory } from "./thermalIndex";

export interface LocationReading {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  tempC: number;
  rh: number;
  windKmh: number;
  score: number;
  category: RiskCategory;
  ndmaTier: "Yellow" | "Orange" | "Red";
  recordedAt: string;
}

// Latest reading for every location — powers the map, search, top-risk cards.
export async function fetchLatestReadings(): Promise<LocationReading[]> {
  const { data, error } = await supabase
    .from("thermal_index")
    .select(
      "temp_c, rh, wind_kmh, score, category, ndma_tier, recorded_at, locations(id, name, state, lat, lng)"
    )
    .order("recorded_at", { ascending: false });

  if (error) throw error;

  // keep only the most recent row per location
  const seen = new Set<string>();
  const rows: LocationReading[] = [];
  for (const row of data ?? []) {
    const loc = Array.isArray(row.locations) ? row.locations[0] : row.locations;
    if (!loc || seen.has(loc.id)) continue;
    seen.add(loc.id);
    rows.push({
      id: loc.id,
      name: loc.name,
      state: loc.state,
      lat: loc.lat,
      lng: loc.lng,
      tempC: row.temp_c,
      rh: row.rh,
      windKmh: row.wind_kmh,
      score: row.score,
      category: row.category as RiskCategory,
      ndmaTier: row.ndma_tier as "Yellow" | "Orange" | "Red",
      recordedAt: row.recorded_at,
    });
  }
  return rows;
}

// Historical trend for one location, used by CityDetailPanel's chart.
export async function fetchTrend(locationId: string, sinceDays: number) {
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("thermal_index")
    .select("score, recorded_at")
    .eq("location_id", locationId)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Save a subscription — called from CityDetailPanel's Email/SMS buttons.
export async function subscribeToLocation(
  locationId: string,
  opts: { email?: string; phone?: string; channelEmail: boolean; channelSms: boolean }
) {
  const { error } = await supabase.from("subscriptions").insert({
    location_id: locationId,
    email: opts.email ?? null,
    phone: opts.phone ?? null,
    channel_email: opts.channelEmail,
    channel_sms: opts.channelSms,
  });
  if (error) throw error;
}

// Nearest location to a lat/lng, for the "My Location" view. Simple
// client-side haversine over the location list — fine at India-city scale.
export function nearestLocation(readings: LocationReading[], lat: number, lng: number) {
  function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371;
    const dLat = ((bLat - aLat) * Math.PI) / 180;
    const dLng = ((bLng - aLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return readings.reduce<LocationReading | null>((closest, r) => {
    const d = distanceKm(lat, lng, r.lat, r.lng);
    const closestD = closest ? distanceKm(lat, lng, closest.lat, closest.lng) : Infinity;
    return d < closestD ? r : closest;
  }, null);
}
