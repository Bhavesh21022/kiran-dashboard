// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

export interface LocationReading {
  id: string;
  name: string;
  state: string;
  tempC: number;
  humidity: number;
  windSpeed?: number;       // Added as per SIH PPT requirements
  solarRadiation?: number;  // Added as per SIH PPT requirements
  lng?: number;
  lat?: number;
  riskCategory?: "Low" | "Moderate" | "High" | "Extreme" | string;
}

// Dummy fetch function to prevent import errors in other components
export async function getLocations(): Promise<LocationReading[]> {
  return [
    { 
      id: "1", name: "Ahmedabad", state: "Gujarat", tempC: 42, 
      humidity: 65, windSpeed: 14, solarRadiation: 850, riskCategory: "Extreme" 
    },
    { 
      id: "2", name: "Vadodara", state: "Gujarat", tempC: 40, 
      humidity: 55, windSpeed: 18, solarRadiation: 780, riskCategory: "High" 
    },
    { 
      id: "3", name: "Delhi", state: "Delhi", tempC: 38, 
      humidity: 40, windSpeed: 22, solarRadiation: 650, riskCategory: "Moderate" 
    },
  ];
}