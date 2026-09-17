// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

import { supabase } from './supabaseClient';

export interface LocationReading {
  id: string;
  name: string;
  state: string;
  tempC: number;
  humidity: number;
  windSpeed?: number;       
  solarRadiation?: number;  
  lng?: number;
  lat?: number;
  riskCategory?: "Low" | "Moderate" | "High" | "Extreme" | string;
}

// Fallback dummy data in case DB connection fails or is empty
const fallbackData: LocationReading[] = [
  { id: "1", name: "Ahmedabad", state: "Gujarat", tempC: 43, humidity: 65, windSpeed: 14, solarRadiation: 850, lng: 72.5714, lat: 23.0225, riskCategory: "Extreme" },
  { id: "2", name: "Vadodara", state: "Gujarat", tempC: 40, humidity: 55, windSpeed: 18, solarRadiation: 780, lng: 73.1812, lat: 22.3072, riskCategory: "High" },
  { id: "3", name: "Delhi", state: "Delhi", tempC: 38, humidity: 40, windSpeed: 22, solarRadiation: 650, lng: 77.2090, lat: 28.6139, riskCategory: "Moderate" },
];

export async function getLocations(): Promise<LocationReading[]> {
  try {
    // Supabase se 'weather_readings' ya teri jo bhi table hai, wahan se data mangwana
    // Assume karte hain table ka naam 'locations' hai. Change it if your schema.sql has a different name.
    const { data, error } = await supabase
      .from('locations') // Ensure this matches your Supabase table name
      .select('*')
      .limit(10);

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return fallbackData; // DB error hone par dashboard crash na ho
    }

    if (!data || data.length === 0) {
      console.warn("Supabase returned empty data. Using fallback.");
      return fallbackData;
    }

    // Agar data mila toh risk category calculate karke bhejna (Basic logic for now)
    return data.map((loc: any) => ({
      ...loc,
      riskCategory: loc.tempC >= 42 ? "Extreme" : loc.tempC >= 40 ? "High" : loc.tempC >= 35 ? "Moderate" : "Low"
    }));

  } catch (err) {
    console.error("Unexpected error fetching locations:", err);
    return fallbackData;
  }
}