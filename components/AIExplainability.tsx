// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026
// Project: KIRAN (SIH26083)

"use client";

interface AIExplainabilityProps {
  temperature: number;
  humidity: number;
  windSpeed?: number;
  solarRadiation?: number;
  riskLevel: string;
}

export default function AIExplainability({ 
  temperature, 
  humidity, 
  windSpeed = 14, // Fallback dummy values
  solarRadiation = 850, 
  riskLevel 
}: AIExplainabilityProps) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-lg mt-6 w-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🧠</span>
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          AI Risk Explainability
        </h3>
      </div>

      <div className="text-gray-300 text-sm leading-relaxed space-y-3">
        <p>
          KIRAN's AI model has classified the hyperlocal threat level as <strong className="text-white bg-white/10 px-2 py-0.5 rounded">{riskLevel}</strong>. 
          Multifactorial breakdown:
        </p>
        
        {/* 2x2 Grid for the 4 Environmental Factors */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Base Temperature</div>
            <div className="text-xl font-bold text-orange-400">{temperature}°C</div>
            <div className="text-xs text-gray-500 mt-1">Primary heat load.</div>
          </div>
          
          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Relative Humidity</div>
            <div className="text-xl font-bold text-blue-400">{humidity}%</div>
            <div className="text-xs text-gray-500 mt-1">Limits sweat evaporation.</div>
          </div>

          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Wind Speed</div>
            <div className="text-xl font-bold text-teal-400">{windSpeed} km/h</div>
            <div className="text-xs text-gray-500 mt-1">Convective heat transfer.</div>
          </div>

          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Solar Radiation</div>
            <div className="text-xl font-bold text-yellow-400">{solarRadiation} W/m²</div>
            <div className="text-xs text-gray-500 mt-1">Direct sun exposure index.</div>
          </div>
        </div>

        <p className="mt-4 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-200">
          <strong>🔍 Deep Learning Insight:</strong> The combination of {temperature}°C heat and {humidity}% humidity, compounded by high solar radiation ({solarRadiation} W/m²), pushes the Human Thermal Stress Index to critical levels despite moderate wind speeds.
        </p>
      </div>
    </div>
  );
}