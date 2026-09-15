"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function SubscribeAlerts() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg(""); // Clear previous messages

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Checking Supabase Environment Variables:");
    console.log("URL exists:", !!supabaseUrl);
    console.log("Key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase Keys missing in .env.local!");
      setMsg("Error: Supabase config missing. Check .env.local");
      setStatus("error");
      return;
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log("Sending request to Supabase...");

      const { data, error } = await supabase
        .from("subscribers")
        .insert([{ email, city }])
        .select(); // Ask Supabase to return the inserted data to verify

      console.log("Supabase Response - Data:", data);
      console.log("Supabase Response - Error:", error);

      if (error) {
        if (error.code === "23505") {
          setMsg("Ye email already subscribed hai!");
        } else {
          setMsg(`Error: ${error.message || "Failed to insert"}`);
        }
        setStatus("error");
      } else {
        setMsg("Success! Heatwave alerts active ho gaye.");
        setStatus("success");
        setEmail("");
        setCity("");
      }
    } catch (err: any) {
      console.error("Network or setup error:", err);
      setMsg(`Network Error: ${err.message || "Failed to fetch"}`);
      setStatus("error");
    }
  };

  return (
    <div className="bg-black/60 border border-white/20 p-8 rounded-3xl shadow-[0_0_30px_rgba(249,115,22,0.15)] mt-8 relative z-50 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          📨 Get Heatwave Alerts
        </h3>
        <p className="text-sm text-gray-400 mt-2">Receive automatic emergency emails for your city.</p>
      </div>

      <form onSubmit={handleSubscribe} className="flex flex-col gap-5">
        <input 
          type="email" 
          required 
          placeholder="Enter your email address" 
          className="bg-black/80 border-2 border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all text-lg placeholder:text-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="text" 
          required 
          placeholder="Your City (e.g., Vadodara)" 
          className="bg-black/80 border-2 border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all text-lg placeholder:text-gray-600"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="mt-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-extrabold py-4 rounded-xl transition-all disabled:opacity-50 text-lg shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1"
        >
          {status === "loading" ? "⏳ Subscribing..." : "Subscribe Now"}
        </button>
      </form>

      {status === "success" && <p className="text-green-400 text-lg font-bold text-center mt-6 animate-pulse">✅ {msg}</p>}
      {status === "error" && <p className="text-red-400 text-lg font-bold text-center mt-6">❌ {msg}</p>}
    </div>
  );
}