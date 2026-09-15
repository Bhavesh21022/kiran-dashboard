"""
KIRAN - Thermal Stress Index (TSI)
-----------------------------------
This is THE single source of truth for the Thermal Stress Index calculation.
Call this exact function from:
  - the Supabase Edge Function that writes new rows into `thermal_index`
  - the FastAPI model service (if you run a separate ML/forecast service)
Never reimplement this logic anywhere else, including the frontend.

Base method: Rothfusz Heat Index regression (NOAA), adjusted with an
India-calibration offset, mapped to IMD/NDMA Heat Action Plan tiers.
"""

from dataclasses import dataclass
from typing import Literal

RiskCategory = Literal["Low", "Moderate", "High", "Extreme"]
NDMATier = Literal["Yellow", "Orange", "Red"]

INDIA_HUMIDITY_TOLERANCE_OFFSET = 0.92  # dampens RH contribution vs NWS baseline


@dataclass
class ThermalResult:
    score: float          # normalized 0-100 stress score
    heat_index_c: float   # apparent temperature, Celsius
    category: RiskCategory
    ndma_tier: NDMATier


def _to_f(c: float) -> float:
    return c * 9 / 5 + 32


def _to_c(f: float) -> float:
    return (f - 32) * 5 / 9


def calculate_thermal_stress(temp_c: float, rh: float, wind_kmh: float = 0.0) -> ThermalResult:
    """
    temp_c: dry bulb air temperature in Celsius
    rh: relative humidity, 0-100
    wind_kmh: wind speed in km/h (optional refinement)
    """
    t = _to_f(temp_c)
    r = rh * INDIA_HUMIDITY_TOLERANCE_OFFSET

    if t < 80:
        hi_f = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + r * 0.094)
    else:
        hi_f = (
            -42.379
            + 2.04901523 * t
            + 10.14333127 * r
            - 0.22475541 * t * r
            - 0.00683783 * t * t
            - 0.05481717 * r * r
            + 0.00122874 * t * t * r
            + 0.00085282 * t * r * r
            - 0.00000199 * t * t * r * r
        )

    if wind_kmh > 8:
        hi_f -= min((wind_kmh - 8) * 0.05, 3)

    heat_index_c = round(_to_c(hi_f), 1)

    # Map heat index (C) to a 0-100 score, calibrated against IMD
    # heatwave departure criteria for the Indian plains.
    if heat_index_c <= 30:
        score = max(0.0, (heat_index_c / 30) * 40)
    elif heat_index_c <= 38:
        score = 40 + ((heat_index_c - 30) / 8) * 20
    elif heat_index_c <= 45:
        score = 60 + ((heat_index_c - 38) / 7) * 20
    else:
        score = min(100.0, 80 + ((heat_index_c - 45) / 5) * 20)
    score = round(score, 1)

    if score < 40:
        category: RiskCategory = "Low"
        ndma_tier: NDMATier = "Yellow"
    elif score < 60:
        category = "Moderate"
        ndma_tier = "Yellow"
    elif score < 80:
        category = "High"
        ndma_tier = "Orange"
    else:
        category = "Extreme"
        ndma_tier = "Red"

    return ThermalResult(score=score, heat_index_c=heat_index_c, category=category, ndma_tier=ndma_tier)


if __name__ == "__main__":
    # quick manual sanity check
    for temp, rh in [(28, 40), (36, 55), (42, 35), (47, 20)]:
        result = calculate_thermal_stress(temp, rh)
        print(f"{temp}C / {rh}% RH -> {result}")
