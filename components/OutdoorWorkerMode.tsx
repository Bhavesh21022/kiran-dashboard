"use client";

interface OutdoorWorkerModeProps {
  riskLevel: "Low" | "Moderate" | "High" | "Extreme" | string;
}

export default function OutdoorWorkerMode({ riskLevel }: OutdoorWorkerModeProps) {
  // Risk ke hisaab se alert set karna
  const isDanger = riskLevel === "High" || riskLevel === "Extreme";

  return (
    <div className="bg-black/60 border border-white/20 p-6 rounded-3xl shadow-lg mt-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">👷</span>
        <h3 className="text-xl font-bold text-white">Outdoor Worker Mode</h3>
      </div>

      <div className={`p-4 rounded-xl border-2 ${isDanger ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
        <h4 className={`font-bold text-lg ${isDanger ? 'text-red-400' : 'text-green-400'}`}>
          {isDanger ? "⚠️ STRICT WARNING: Alter Work Hours" : "✅ Safe for Standard Work"}
        </h4>
        
        <ul className="mt-3 space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span>⏰</span>
            <span><strong>Safe Working Hours:</strong> 6:00 AM - 11:00 AM & After 4:00 PM.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🚫</span>
            <span className={isDanger ? "text-red-300 font-semibold" : ""}>
              <strong>Avoid Outdoor Labor:</strong> 11:00 AM to 4:00 PM (Peak Solar Radiation).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>💧</span>
            <span><strong>Hydration Protocol:</strong> Drink 250ml of water every 20 minutes, even if not thirsty.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}