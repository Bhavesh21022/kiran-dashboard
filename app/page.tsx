// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SubscribeAlerts from "@/components/SubscribeAlerts";
import Navbar from "@/components/Navbar";
import SunCompanion from "@/components/SunCompanion";
import CityDetailPanel from "@/components/CityDetailPanel";
import TopRiskCities from "@/components/TopRiskCities";
import EmergencyButton from "@/components/EmergencyButton";
import Chatbot from "@/components/Chatbot";
import { RiskCategory } from "@/lib/thermalIndex";
import { fetchLatestReadings, LocationReading, nearestLocation } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { addToSearchHistory } from "@/lib/localHistory";
import { MenuProvider } from "@/lib/MenuContext";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });

const FALLBACK_MY_LOCATION: LocationReading = {
  id: "mock-my-location", name: "Locating...", state: "Please wait",
  lat: 22.3072, lng: 73.1812, tempC: 0, rh: 0, windKmh: 0,
  score: 0, category: "Moderate", ndmaTier: "Yellow", recordedAt: "",
};

function nationalAverageCategory(readings: LocationReading[]): RiskCategory {
  if (readings.length === 0) return "Moderate";
  const avg = readings.reduce((sum, r) => sum + r.score, 0) / readings.length;
  if (avg < 40) return "Low";
  if (avg < 60) return "Moderate";
  if (avg < 80) return "High";
  return "Extreme";
}

export default function DashboardPage() {
  const [readings, setReadings] = useState<LocationReading[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Real Live GPS Coordinates ke liye
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [triggerMapZoom, setTriggerMapZoom] = useState<number>(0);
  const [searchedCity, setSearchedCity] = useState<{name: string, lat: number, lon: number} | null>(null);
  
  const { t, lang } = useI18n();

  useEffect(() => {
    fetchLatestReadings()
      .then(setReadings)
      .catch((err) => console.error("Data load failed:", err))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const handleCitySelect = (e: any) => {
      setSearchedCity(e.detail);
      setSelectedId(null);
    };
    window.addEventListener('citySelected', handleCitySelect);
    return () => window.removeEventListener('citySelected', handleCitySelect);
  }, []);

  const handlePreciseLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setMyCoords({ lat, lng: lon });
          setTriggerMapZoom(Date.now());
        },
        (err) => {
          alert("GPS Access Denied! URL bar mein 🔒 icon par click karke Location Allow karein.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Browser location support nahi karta.");
    }
  };

  const myReading =
    (myCoords && readings.length > 0 && nearestLocation(readings, myCoords.lat, myCoords.lng)) ||
    (readings.length > 0 ? readings[0] : FALLBACK_MY_LOCATION);

  const selectedReading = readings.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedReading) {
      addToSearchHistory({ locationId: selectedReading.id, name: selectedReading.name, state: selectedReading.state });
    }
  }, [selectedReading]);

  const activeCityForPanel = searchedCity || (selectedReading ? { name: selectedReading.name, lat: selectedReading.lat, lon: selectedReading.lng } : null);

  return (
    <MenuProvider>
      <main className="min-h-screen font-body relative">
        <Navbar nationalAvgCategory={nationalAverageCategory(readings)} locations={readings} onSelectLocation={setSelectedId} />
        <Sidebar />

        <div className="px-4 pb-24 pt-24 sm:pl-64 sm:pr-8">
          
          <section className="mb-6 mt-4 relative z-30">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                 {t("nationalOverview")} 🗺️
              </h2>
              
              <button 
                onClick={handlePreciseLocation}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 hover:bg-green-500 hover:text-black text-green-400 rounded-full font-bold transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)] text-sm"
              >
                <span className="text-lg animate-pulse">📍</span> Find Me
              </button>
            </div>
            
            <MapView 
              readings={readings} 
              onSelectLocation={setSelectedId} 
              myLocation={myCoords} 
              zoomTrigger={triggerMapZoom} 
            />
          </section>

          <section className="mb-8 flex flex-col items-center text-center mt-12 bg-black/40 p-6 rounded-3xl border border-white/10 relative z-20">
            <h1 className="mb-1 font-display text-2xl font-semibold">{t("myLocation")}</h1>
            <p className="mb-4 text-sm text-white/50">
              {myCoords 
                ? "Live GPS locked. Sun companion showing real-time precise weather." 
                : "Click 'Find Me' above for precise live reading."}
            </p>
            
            <SunCompanion 
              category={myReading.category} 
              locationName={myCoords ? "Your Precise Location" : myReading.name} 
              lang={lang} 
              coords={myCoords} 
            />
            
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold">{t("topRiskCities")}</h2>
            <TopRiskCities readings={readings} onSelect={setSelectedId} />
          </section>

          {/* NEW ALERTS SUBSCRIPTION FORM */}
          <section className="mb-10 mt-8 relative z-30">
             <SubscribeAlerts />
          </section>

        </div>

        {activeCityForPanel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-5xl my-auto mt-24">
              <button onClick={() => { setSelectedId(null); setSearchedCity(null); }} className="absolute -top-12 right-2 z-50 px-4 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition shadow-lg font-bold flex items-center gap-2">
                ✕ Close Panel
              </button>
              <CityDetailPanel city={activeCityForPanel} />
            </div>
          </div>
        )}

        <EmergencyButton />
        <Chatbot />
      </main>
    </MenuProvider>
  );
}