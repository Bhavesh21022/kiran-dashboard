// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

"use client";

interface MapViewProps {
  lat: number;
  lng: number;
  city: string;
}

export default function MapView({ lat, lng, city }: MapViewProps) {
  // OpenStreetMap ka embedded URL (Bina API key ke chalta hai)
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.2}%2C${lat - 0.2}%2C${lng + 0.2}%2C${lat + 0.2}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="w-full h-[60vh] min-h-[400px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl group">
      
      {/* 1. Inverted Dark Mode Map */}
      <iframe
        src={mapSrc}
        className="w-full h-full absolute inset-0 filter invert-[90%] hue-rotate-180 contrast-125 transition-transform duration-1000 group-hover:scale-105"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        title={`Heat Map for ${city}`}
      ></iframe>

      {/* 2. Heatwave Risk Overlay (Red Tint) */}
      <div className="absolute inset-0 bg-red-500/20 pointer-events-none mix-blend-color"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

      {/* 3. Live Radar Badge */}
      <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-lg z-10 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-sm font-bold text-white tracking-wider">
          LIVE HEAT ZONE : {city.toUpperCase()}
        </span>
      </div>
    </div>
  );
}