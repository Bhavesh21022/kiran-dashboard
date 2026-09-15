// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MenuProvider } from "@/lib/MenuContext";

export default function GlobalAlertsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNasaData = async () => {
      try {
        const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=12");
        const data = await res.json();
        setEvents(data.events);
      } catch (error) {
        console.error("NASA API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNasaData();
  }, []);

  return (
    <MenuProvider>
      <main className="min-h-screen font-body relative bg-gray-950 text-white">
       <Navbar nationalAvgCategory="Moderate" locations={[]} onSelectLocation={() => {}} />
        <Sidebar />
        
        <div className="px-4 pb-24 pt-28 sm:pl-64 sm:pr-8 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              🌍 <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">NASA EONET Live Alerts</span>
            </h1>
            <p className="text-gray-400 mt-2">Real-time global tracking of natural events via Earth Observatory.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev.id} className="bg-black/60 border border-red-500/20 p-5 rounded-2xl shadow-lg hover:border-red-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-bold uppercase border border-red-500/30">
                      {ev.categories[0]?.title}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(ev.geometry[0]?.date).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2 leading-tight">{ev.title}</h2>
                  <p className="text-sm text-gray-400 mt-4">
                    📍 Coordinates: {ev.geometry[0]?.coordinates[1]?.toFixed(2)}, {ev.geometry[0]?.coordinates[0]?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </MenuProvider>
  );
}