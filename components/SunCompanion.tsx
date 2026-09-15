"use client";
import { useEffect, useState, useRef } from "react";
import { RiskCategory } from "@/lib/thermalIndex";

interface SunCompanionProps {
  category: RiskCategory;
  locationName: string;
  lang: string;
  coords?: { lat: number; lng: number } | null;
}

export default function SunCompanion({ category, locationName, lang, coords }: SunCompanionProps) {
  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Eye tracking ke liye state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Weather aur text setup
  let advice = "Weather looks pleasant. Enjoy your day!";
  let sunBase = "#fde047";
  let sunGlow = "#facc15";
  let rayColor = "#fde047";

  if (category === "Moderate") {
    advice = lang === "hi" ? "Halki garmi hai, paani peete rahein." : "It's a bit warm, stay hydrated.";
  } else if (category === "High") {
    sunBase = "#fdba74";
    sunGlow = "#f97316";
    rayColor = "#fdba74";
    advice = lang === "hi" ? "Bahut garmi hai! Dhoop mein mat niklo." : "It's quite hot! Avoid direct sunlight.";
  } else if (category === "Extreme") {
    sunBase = "#fca5a5";
    sunGlow = "#ef4444";
    rayColor = "#fca5a5";
    advice = lang === "hi" ? "Khatarnak lu (heatwave) chal rahi hai. Safe rahein!" : "It's extremely hot—please stay safe.";
  }

  // Live Temperature Fetching
  useEffect(() => {
    const fetchLiveGPSWeather = async () => {
      if (coords) {
        try {
          setLoading(true);
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m`);
          const data = await res.json();
          setLiveTemp(data.current.temperature_2m);
        } catch (error) {
          console.error("Live GPS fetch error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchLiveGPSWeather();
  }, [coords]);

  // Eye Tracking Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const svgCenterX = rect.left + rect.width / 2;
      const svgCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - svgCenterX;
      const dy = e.clientY - svgCenterY;
      const angle = Math.atan2(dy, dx);
      
      const maxDistance = 4.5;
      const distance = Math.min(Math.hypot(dx, dy) / 40, maxDistance);

      setMousePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* 3D Cute Sun Container */}
      <div className="relative flex h-48 w-48 items-center justify-center mb-2">
        
        {/* Waving/Spinning Rays - PERFECT 360 DEGREE NOW */}
        <svg className="absolute inset-0 w-full h-full animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
          {[...Array(12)].map((_, i) => (
            <line 
              key={i} 
              x1="50" 
              y1="4" 
              x2="50" 
              y2="15" 
              stroke={rayColor} 
              strokeWidth="6" 
              strokeLinecap="round" 
              opacity="0.8"
              transform={`rotate(${i * 30} 50 50)`} 
            />
          ))}
        </svg>

        {/* The Cute Face (With Eye Tracking) */}
        <svg 
          ref={svgRef} 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] z-10 scale-[0.75]"
        >
          <defs>
            <radialGradient id="sunGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={sunBase} />
              <stop offset="100%" stopColor={sunGlow} />
            </radialGradient>
          </defs>
          
          <circle cx="50" cy="50" r="45" fill="url(#sunGradient)" />

          <circle cx="22" cy="55" r="6" fill="#ff7675" opacity="0.6" />
          <circle cx="78" cy="55" r="6" fill="#ff7675" opacity="0.6" />

          {/* LEFT EYE */}
          <circle cx="34" cy="45" r="11" fill="white" />
          <circle cx={34 + mousePos.x} cy={45 + mousePos.y} r="6" fill="#1c1917" />
          <circle cx={32 + mousePos.x} cy={43 + mousePos.y} r="2" fill="white" />

          {/* RIGHT EYE */}
          <circle cx="66" cy="45" r="11" fill="white" />
          <circle cx={66 + mousePos.x} cy={45 + mousePos.y} r="6" fill="#1c1917" />
          <circle cx={64 + mousePos.x} cy={43 + mousePos.y} r="2" fill="white" />

          {/* MOUTH EXPRESSIONS */}
          {category === "Extreme" ? (
            <g>
               <path d="M 40 68 Q 50 58 60 68" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" fill="transparent" />
               <path d="M 72 30 Q 78 40 72 47 Q 66 40 72 30" fill="#38bdf8" className="animate-bounce" />
            </g>
          ) : category === "High" ? (
            <g>
               <path d="M 42 65 Q 50 62 58 65" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" fill="transparent" />
               <path d="M 72 30 Q 78 38 72 44 Q 66 38 72 30" fill="#38bdf8" opacity="0.8" />
            </g>
          ) : (
            <path 
              d={`M 38 ${58 + (mousePos.y * 0.5)} Q 50 ${72 + (mousePos.y * 0.8)} 62 ${58 + (mousePos.y * 0.5)}`} 
              stroke="#1c1917" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              fill="transparent" 
            />
          )}
        </svg>
      </div>

      <h3 className="mt-2 text-sm font-bold uppercase tracking-widest text-white z-20 relative">
        {locationName === "Locating..." ? (
            <span className="animate-pulse">Locating...</span>
        ) : (
            <>
                {locationName} {liveTemp && <span className="text-yellow-400 ml-2">({liveTemp}°C)</span>}
            </>
        )}
      </h3>
      
      <p className="mt-1 text-xs text-white/70 max-w-[250px] text-center z-20 relative">
        {!loading && locationName !== "Locating..." ? advice : "Calibrating thermal stress..."}
      </p>
    </div>
  );
}