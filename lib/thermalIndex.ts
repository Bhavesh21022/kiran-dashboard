/**
 * KIRAN — Thermal Stress Index (TSI)
 * -----------------------------------
 * IMPORTANT: This function must stay byte-for-byte identical in logic to
 * backend/thermal_index.py. The frontend NEVER recomputes this — it only
 * displays what the backend already calculated and stored. This copy exists
 * here only for local dev/testing/storybook use, not for production display.
 *
 * Base method: Rothfusz Heat Index regression, adjusted with an
 * India-calibration offset (Indian populations show heat-stress onset at
 * slightly higher humidity than the temperate-climate-derived NWS formula
 * assumes). Thresholds are mapped to IMD/NDMA Heat Action Plan tiers:
 *   Yellow  -> Low / Moderate
 *   Orange  -> High
 *   Red     -> Extreme
 */

export type RiskCategory = "Low" | "Moderate" | "High" | "Extreme";

export interface ThermalInput {
  tempC: number; // dry bulb air temperature, Celsius
  rh: number; // relative humidity, 0-100
  windKmh?: number; // wind speed, km/h (optional refinement)
}

export interface ThermalResult {
  score: number; // normalized 0-100 stress score
  heatIndexC: number; // apparent temperature, Celsius
  category: RiskCategory;
  ndmaTier: "Yellow" | "Orange" | "Red";
}

const INDIA_HUMIDITY_TOLERANCE_OFFSET = 0.92; // dampens RH contribution vs NWS baseline

function toFahrenheit(c: number) {
  return c * 9 / 5 + 32;
}
function toCelsius(f: number) {
  return (f - 32) * 5 / 9;
}

export function calculateThermalStress(input: ThermalInput): ThermalResult {
  const { tempC, rh, windKmh = 0 } = input;
  const T = toFahrenheit(tempC);
  const R = rh * INDIA_HUMIDITY_TOLERANCE_OFFSET;

  // Rothfusz regression (NOAA), valid for T >= 80F; simple average used below it
  let hiF: number;
  if (T < 80) {
    hiF = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);
  } else {
    hiF =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;
  }

  // Wind speed provides mild evaporative relief above 8 km/h
  if (windKmh > 8) {
    hiF -= Math.min((windKmh - 8) * 0.05, 3);
  }

  const heatIndexC = Math.round(toCelsius(hiF) * 10) / 10;

  // Map heat index (C) to a 0-100 score, calibrated so that:
  // <30C -> 0-40 (Low), 30-38C -> 40-60 (Moderate),
  // 38-45C -> 60-80 (High), >45C -> 80-100 (Extreme)
  // matching IMD heatwave departure criteria for the Indian plains.
  let score: number;
  if (heatIndexC <= 30) {
    score = Math.max(0, (heatIndexC / 30) * 40);
  } else if (heatIndexC <= 38) {
    score = 40 + ((heatIndexC - 30) / 8) * 20;
  } else if (heatIndexC <= 45) {
    score = 60 + ((heatIndexC - 38) / 7) * 20;
  } else {
    score = Math.min(100, 80 + ((heatIndexC - 45) / 5) * 20);
  }
  score = Math.round(score * 10) / 10;

  let category: RiskCategory;
  let ndmaTier: "Yellow" | "Orange" | "Red";
  if (score < 40) {
    category = "Low";
    ndmaTier = "Yellow";
  } else if (score < 60) {
    category = "Moderate";
    ndmaTier = "Yellow";
  } else if (score < 80) {
    category = "High";
    ndmaTier = "Orange";
  } else {
    category = "Extreme";
    ndmaTier = "Red";
  }

  return { score, heatIndexC, category, ndmaTier };
}

export const riskColor: Record<RiskCategory, string> = {
  Low: "#2DD4BF",
  Moderate: "#F59E0B",
  High: "#FB6D3A",
  Extreme: "#EF4444",
};

export const sunCompanionMessage: Record<RiskCategory, { en: string; hi: string }> = {
  Low: { en: "I'm feeling normal today.", hi: "आज मौसम सामान्य है।" },
  Moderate: { en: "It's getting warm out there.", hi: "बाहर गर्मी बढ़ रही है।" },
  High: { en: "It's quite hot — take care.", hi: "काफी गर्मी है — ध्यान रखें।" },
  Extreme: { en: "It's extremely hot — please stay safe.", hi: "अत्यधिक गर्मी है — कृपया सुरक्षित रहें।" },
};
