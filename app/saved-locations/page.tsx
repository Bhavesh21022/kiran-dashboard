// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MenuProvider } from "@/lib/MenuContext";
import { getSearchHistory } from "@/lib/localHistory"; // Yahan fix kiya hai
import Link from "next/link";

export default function SavedLocationsPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // getSavedLocations ko getSearchHistory se replace kar diya jo ki already working hai
    setHistory(getSearchHistory());
  }, []);

  return (
    <MenuProvider>
      <main className="min-h-screen font-body relative bg-gray-950 text-white">
        <Navbar nationalAvgCategory="Moderate" locations={[]} onSelectLocation={() => {}} />
        <Sidebar />
        
        <div className="px-4 pb-24 pt-28 sm:pl-64 sm:pr-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-500">
              🔖 Saved Locations
            </h1>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {history.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold group-hover:text-cyan-400 transition-colors">{item.name}</span>
                      <span className="text-sm text-gray-400 mt-1">{item.state || "Recent Search"}</span>
                    </div>
                    <Link href="/" className="px-6 py-3 bg-cyan-600/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/50 rounded-full font-bold transition-all shadow-lg">
                      Check Heat
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <span className="text-5xl block mb-4 animate-pulse text-cyan-900">📍</span>
                <p className="text-xl">No saved locations yet.</p>
                <p className="text-sm mt-2 opacity-60">Cities you search will appear here automatically.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </MenuProvider>
  );
}