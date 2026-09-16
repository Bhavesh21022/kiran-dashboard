"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SubscribeAlerts from "@/components/SubscribeAlerts";
import OutdoorWorkerMode from "@/components/OutdoorWorkerMode";
import AIExplainability from "@/components/AIExplainability";

// Typescript interface for our location data to prevent Vercel errors
interface DashboardLocation {
  id: string;
  name: string;
  state: string;
  tempC: number;
  humidity: number;
  riskCategory: "Low" | "Moderate" | "High" | "Extreme";
}

// Dummy data for testing (Replace with your database later)
const LOCATIONS: DashboardLocation[] = [
  { id: "1", name: "Ahmedabad", state: "Gujarat", tempC: 43, humidity: 65, riskCategory: "Extreme" },
  { id: "2", name: "Vadodara", state: "Gujarat", tempC: 40, humidity: 55, riskCategory: "High" },
  { id: "3", name: "Pune", state: "Maharashtra", tempC: 34, humidity: 45, riskCategory: "Moderate" },
  { id: "4", name: "Shimla", state: "Himachal Pradesh", tempC: 22, humidity: 30, riskCategory: "Low" },
];

export default function DashboardPage() {
  const [selectedLocId, setSelectedLocId] = useState<string>("1");

  // Find the currently selected city, default to Ahmedabad if not found
  const activeLocation = LOCATIONS.find(loc => loc.id === selectedLocId) || LOCATIONS[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30 pb-16">
      
      {/* 1. Fixed Top Navbar */}
      <Navbar
        nationalAvgCategory="High"
        locations={LOCATIONS as any} // Cast as any to bypass strict type checking during Vercel build
        onSelectLocation={(id) => setSelectedLocId(id)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-28">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
            Heatwave Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Real-time Hyperlocal AI Thermal Stress Monitoring
          </p>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Data & AI Explanations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main City Weather Card */}
            <div className="bg-black/60 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background Glow Effect */}
              <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full mix-blend-screen pointer-events-none opacity-20 ${
                activeLocation.riskCategory === "Extreme" ? "bg-red-500" :
                activeLocation.riskCategory === "High" ? "bg-orange-500" : "bg-yellow-500"
              }`}></div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-4xl font-bold">{activeLocation.name}</h2>
                  <p className="text-gray-400 text-lg mt-1">{activeLocation.state}</p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                    {activeLocation.tempC}°C
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 relative z-10">
                <span className={`px-5 py-2.5 rounded-full font-extrabold text-sm border-2 shadow-lg tracking-wide ${
                  activeLocation.riskCategory === 'Extreme' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20' :
                  activeLocation.riskCategory === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-500/20' :
                  activeLocation.riskCategory === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  'bg-green-500/20 text-green-400 border-green-500/50'
                }`}>
                  ● RISK LEVEL: {activeLocation.riskCategory.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Poster Feature 1: AI Explainability Component */}
            <AIExplainability
              temperature={activeLocation.tempC}
              humidity={activeLocation.humidity}
              riskLevel={activeLocation.riskCategory}
            />

            {/* Poster Feature 2: Outdoor Worker Mode Component */}
            <OutdoorWorkerMode riskLevel={activeLocation.riskCategory} />
            
          </div>

          {/* RIGHT COLUMN: Map & Alerts Form */}
          <div className="space-y-6">
            
            {/* Dynamic Map Placeholder (For future Integration) */}
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-colors">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗺️</span>
              <h3 className="font-bold text-gray-200 text-lg">Hyperlocal Risk Map</h3>
              <p className="text-sm text-gray-500 mt-2 px-4">Interactive zone mapping will be displayed here.</p>
            </div>

            {/* Poster Feature 3: Subscribe for Email Alerts */}
            <SubscribeAlerts />
            
          </div>
        </div>
      </main>
    </div>
  );
}