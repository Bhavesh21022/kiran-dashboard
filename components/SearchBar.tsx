"use client";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 2) {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${val}&count=5&language=en&format=json`);
        const data = await res.json();
        if (data.results) setResults(data.results);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-[60]">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search city for heatwave data..."
        className="w-full p-2.5 pl-5 rounded-full bg-black/40 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md shadow-lg text-sm transition-all"
      />
      
      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-[100]">
          {results.map((city) => (
            <li
              key={city.id}
              className="p-3 hover:bg-gray-800 cursor-pointer text-white border-b border-gray-800 last:border-0 transition-colors flex justify-between items-center"
              onClick={() => {
                // Ye event page.tsx ko batayega ki city select ho gayi hai
                const event = new CustomEvent('citySelected', { 
                  detail: { name: city.name, lat: city.latitude, lon: city.longitude } 
                });
                window.dispatchEvent(event);
                setQuery("");
                setResults([]);
              }}
            >
              <span className="font-semibold text-sm">{city.name}</span>
              <span className="text-xs text-gray-400">{city.admin1}, {city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}