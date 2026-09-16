"use client";

interface AIExplainabilityProps {
  temperature: number;
  humidity: number;
  riskLevel: string;
}

export default function AIExplainability({ temperature, humidity, riskLevel }: AIExplainabilityProps) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-lg mt-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🧠</span>
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          AI Risk Explainability
        </h3>
      </div>

      <div className="text-gray-300 text-sm leading-relaxed space-y-3">
        <p>
          KIRAN's AI has classified the current hyperlocal threat level as <strong className="text-white bg-white/10 px-2 py-0.5 rounded">{riskLevel}</strong>. 
          Here is why:
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Base Temperature</div>
            <div className="text-xl font-bold text-orange-400">{temperature}°C</div>
            <div className="text-xs text-gray-500 mt-1">High base heat load.</div>
          </div>
          <div className="bg-black/50 p-3 rounded-lg border border-white/5">
            <div className="text-gray-400 text-xs mb-1">Relative Humidity</div>
            <div className="text-xl font-bold text-blue-400">{humidity}%</div>
            <div className="text-xs text-gray-500 mt-1">Reduces sweat evaporation.</div>
          </div>
        </div>

        <p className="mt-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-200">
          <strong>🔍 AI Insight:</strong> Although the absolute temperature is {temperature}°C, the high humidity ({humidity}%) prevents the human body from cooling down through sweating. This compound effect pushes the Human Thermal Stress Index to a critical level.
        </p>
      </div>
    </div>
  );
}