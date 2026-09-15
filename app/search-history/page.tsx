// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MenuProvider } from "@/lib/MenuContext";
import { getSearchHistory, clearSearchHistory } from "@/lib/localHistory";
import Link from "next/link";

export default function SearchHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const handleClear = () => {
    clearSearchHistory();
    setHistory([]);
  };

  return (
    <MenuProvider>
      <main className="min-h-screen font-body relative bg-gray-950 text-white">
       <Navbar nationalAvgCategory="Moderate" locations={[]} onSelectLocation={() => {}} />
        <Sidebar />
        
        <div className="px-4 pb-24 pt-28 sm:pl-64 sm:pr-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              🕒 Search History
            </h1>
            <button 
              onClick={handleClear}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            >
              Clear History
            </button>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {history.length > 0 ? (
              <ul className="space-y-4">
                {history.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">📍</span>
                      <div>
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.state || "Recent Search"}</p>
                      </div>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
                      View Weather
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-4">🏜️</span>
                <p>No search history found. Start exploring cities on the dashboard!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </MenuProvider>
  );
}