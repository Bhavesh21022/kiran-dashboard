"use client";
import { useState } from "react";

export default function EmergencyButton() {
  const [loading, setLoading] = useState(false);

  const handleEmergency = () => {
    setLoading(true);
    
    // GPS se live location nikal rahe hain
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          sendEmail(lat, lng);
        },
        (err) => {
          alert("GPS off hai! Bina exact location ke alert bhej rahe hain.");
          sendEmail(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendEmail(null, null);
    }
  };

  const sendEmail = (lat: number | null, lng: number | null) => {
    setLoading(false);
    
    // Yahan tum apna, apne teammate (Mansuri Adil), ya college professor ka test email daal sakte ho
    const toEmail = "emergency.response@example.com"; 
    const subject = encodeURIComponent("🚨 EMERGENCY: Severe Heatwave / Thermal Stress Alert!");
    
    let bodyText = "I am experiencing severe thermal stress/heatstroke and need immediate medical guidance or assistance.\n\n";
    
    if (lat && lng) {
      bodyText += `📍 My Live Location (Google Maps):\nhttps://maps.google.com/?q=${lat},${lng}\n\n`;
      bodyText += `Coordinates: ${lat}, ${lng}\n`;
    } else {
      bodyText += "📍 Location: GPS Access Denied or Unavailable.\n\n";
    }
    
    bodyText += "\nPlease send help or advice immediately.\n\n- Sent via KIRAN Dashboard";
    
    const body = encodeURIComponent(bodyText);
    
    // Ye line automatically Gmail/Email app khol degi draft ke sath
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <button
      onClick={handleEmergency}
      disabled={loading}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.9)] transition-all hover:scale-110 hover:bg-red-500 active:scale-95 border-2 border-red-400/50 disabled:opacity-70 group"
      title="Emergency SOS Alert"
    >
      {loading ? (
        <span className="animate-spin text-2xl">⏳</span>
      ) : (
        <>
          <span className="text-3xl animate-pulse group-hover:animate-none">🚨</span>
          {/* Tooltip on hover */}
          <span className="absolute -top-12 right-0 w-32 rounded-lg bg-black/80 px-2 py-1 text-center text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 border border-white/20 pointer-events-none">
            Send SOS Alert
          </span>
        </>
      )}
    </button>
  );
}