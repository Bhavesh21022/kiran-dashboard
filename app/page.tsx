// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MapView from "@/components/MapView"; // Map import kiya gaya
import { getLocations, LocationReading } from "@/lib/queries";

export default function DashboardPage() {
  const [locations, setLocations] = useState<LocationReading[]>([]);
  const [selectedLocId, setSelectedLocId] = useState("1");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error("Data error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activeLocation = locations.find(loc => loc.id === selectedLocId) || locations[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-16">
      
      {!isLoading && (
        <Navbar
          nationalAvgCategory={(activeLocation?.riskCategory as any) || "High"}
          locations={locations}
          onSelectLocation={(id) => setSelectedLocId(id)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-28">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
              KIRAN Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              AI-Powered Extreme Heatwave Early Warning System
            </p>
          </div>
          {/* Active City Temp Display */}
          {activeLocation && (
            <div className="hidden md:block text-right">
              <p className="text-5xl font-black text-white">{activeLocation.tempC}°C</p>
              <p className="text-orange-400 font-bold">{activeLocation.riskCategory} Risk</p>
            </div>
          )}
        </div>

        {/* Real Interactive Map Area */}
        {activeLocation && activeLocation.lat && activeLocation.lng ? (
          <MapView 
            lat={activeLocation.lat} 
            lng={activeLocation.lng} 
            city={activeLocation.name} 
          />
        ) : (
          <div className="bg-zinc-900 border border-white/10 rounded-3xl h-[60vh] flex flex-col items-center justify-center shadow-xl">
            <span className="text-white animate-pulse">Loading Radar...</span>
          </div>
        )}

      </main>
    </div>
  );
}