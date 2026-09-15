"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CityProps {
  city: { name: string; lat: number; lon: number } | null;
}

export default function CityDetailPanel({ city }: CityProps) {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      
      try {
        // 1. Fetch Current Weather
        const currentRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation&daily=precipitation_probability_max,temperature_2m_min&timezone=auto`
        );
        const currentData = await currentRes.json();
        
        if (currentData.error) {
          throw new Error(currentData.reason || "Live weather fetch fail ho gaya.");
        }
        
        setCurrentWeather(currentData);

        // 2. Fetch Historical Data (Try block inside try block, taaki history fail ho toh live data na ruke)
        try {
          const currentYear = new Date().getFullYear();
          const startYear = currentYear - 5;
          const histRes = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startYear}-01-01&end_date=${currentYear - 1}-12-31&daily=temperature_2m_max&timezone=auto`
          );
          const histData = await histRes.json();

          const yearlyData: Record<string, { maxTemp: number }> = {};
          if (histData.daily && histData.daily.time) {
            histData.daily.time.forEach((time: string, index: number) => {
              const year = time.split("-")[0];
              const temp = histData.daily.temperature_2m_max[index];
              if (temp !== null && temp !== undefined) {
                if (!yearlyData[year] || temp > yearlyData[year].maxTemp) {
                  yearlyData[year] = { maxTemp: temp };
                }
              }
            });
          }

          const processedGraph = Object.keys(yearlyData).map(year => ({
            year,
            temp: parseFloat(yearlyData[year].maxTemp.toFixed(1))
          }));

          setHistoricalData(processedGraph);
        } catch (histError) {
          console.error("Historical fetch error:", histError);
          // Agar history fail hui toh kam se kam graph blank aayega par Live weather dikhega
        }

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setErrorMsg(error.message || "Network error. Weather API connect nahi ho pa rahi hai.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  if (!city) return null;

  // Jab data load ho raha ho tab Spinner dikhega (Black screen nahi)
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-10 p-12 bg-black/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-6"></div>
        <p className="text-white text-xl font-bold animate-pulse">Fetching Weather Model & 5-Year Data...</p>
      </div>
    );
  }

  // Agar API ne koi error diya toh proper message aayega
  if (errorMsg) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-10 p-12 bg-red-950/80 backdrop-blur-xl rounded-3xl border border-red-500/50 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-2xl text-white font-bold mb-2">Data Load Nahi Hua</h2>
        <p className="text-red-300">{errorMsg}</p>
      </div>
    );
  }

  if (!currentWeather || !currentWeather.current) return null;

  const currentTemp = currentWeather.current.temperature_2m || 0;
  const feelsLike = currentWeather.current.apparent_temperature || 0;
  const humidity = currentWeather.current.relative_humidity_2m || 0;
  const coldTemp = currentWeather.daily?.temperature_2m_min?.[0] || "N/A";
  const rainChance = currentWeather.daily?.precipitation_probability_max?.[0] || 0;
  
  const isHeatWave = currentTemp > 40 || feelsLike > 42;

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 p-8 bg-black/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl mb-12 relative z-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-2">{city.name}</h2>
          <p className="text-gray-300">Live Weather & Thermal Predictor</p>
        </div>
        {isHeatWave ? (
          <div className="px-6 py-3 bg-red-500/20 border border-red-500 rounded-full text-red-500 font-bold flex items-center gap-2 animate-pulse mt-4 md:mt-0">
            <span className="text-2xl">🚨</span> DANGER: Heat Wave Active
          </div>
        ) : (
          <div className="px-6 py-3 bg-green-500/20 border border-green-500 rounded-full text-green-400 font-bold flex items-center gap-2 mt-4 md:mt-0">
            <span className="text-xl">✅</span> Conditions Normal
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-5 rounded-2xl border border-orange-500/30 text-center">
          <p className="text-orange-200 text-sm mb-2">Heat (Max)</p>
          <p className="text-4xl font-bold text-orange-400">{currentTemp}°C</p>
        </div>
        <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-5 rounded-2xl border border-blue-500/30 text-center">
          <p className="text-blue-200 text-sm mb-2">Cold (Min)</p>
          <p className="text-4xl font-bold text-blue-400">{coldTemp}°C</p>
        </div>
        <div className="bg-gradient-to-b from-red-500/20 to-transparent p-5 rounded-2xl border border-red-500/30 text-center">
          <p className="text-red-200 text-sm mb-2">Feels Like</p>
          <p className="text-4xl font-bold text-red-400">{feelsLike}°C</p>
        </div>
        <div className="bg-gradient-to-b from-cyan-500/20 to-transparent p-5 rounded-2xl border border-cyan-500/30 text-center">
          <p className="text-cyan-200 text-sm mb-2">Humidity</p>
          <p className="text-4xl font-bold text-cyan-400">{humidity}%</p>
        </div>
        <div className="bg-gradient-to-b from-indigo-500/20 to-transparent p-5 rounded-2xl border border-indigo-500/30 text-center col-span-2 md:col-span-1">
          <p className="text-indigo-200 text-sm mb-2">Rain Chances</p>
          <p className="text-4xl font-bold text-indigo-400">{rainChance}%</p>
        </div>
      </div>

      <div className="bg-black/60 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
          📊 Last 5 Years Extreme Temperature Graph
        </h3>
        <div className="h-72 w-full">
          {historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="year" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} 
                  name="Max Temp (°C)" 
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              5-Year historical data is unavailable for this location.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}