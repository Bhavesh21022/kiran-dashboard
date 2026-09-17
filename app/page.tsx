// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getLocations, LocationReading } from "@/lib/queries";

export default function DashboardPage() {
  const [locations, setLocations] = useState<LocationReading[]>([]);
  const [selectedLocId, setSelectedLocId] = useState("1");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Naye queries.ts se data load karna
    const loadData = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (err) {
        console.error("Data load hone mein error aaya", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Selected city ka data nikalna
  const activeLocation = locations.find(loc => loc.id === selectedLocId) || locations[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-16">
      
      {/* 1. Navbar Jisme Worker Mode aur AI ke popup buttons hain */}
      {!isLoading && (
        <Navbar
          nationalAvgCategory={(activeLocation?.riskCategory as any) || "High"}
          locations={locations}
          onSelectLocation={(id) => setSelectedLocId(id)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-28">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
            KIRAN Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            AI-Powered Extreme Heatwave Early Warning System
          </p>
        </div>

        {/* Map Area */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl h-[60vh] flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          <span className="text-6xl mb-4 z-10">🗺️</span>
          <h3 className="text-2xl font-bold text-gray-200 z-10">Hyperlocal Risk Map</h3>
          <p className="text-gray-500 mt-2 z-10 text-center max-w-md">
            Dynamic risk maps and heat-risk zones will be rendered here.
          </p>
          
          {/* Active City Indicator */}
          {activeLocation && (
            <div className="mt-6 px-6 py-3 bg-black/60 rounded-xl border border-white/10 text-center z-10 backdrop-blur-sm">
              <p className="text-sm text-gray-400">Current Focus</p>
              <p className="text-xl font-bold text-orange-400">{activeLocation.name}, {activeLocation.state}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}