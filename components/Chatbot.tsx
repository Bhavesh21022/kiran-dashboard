"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  text: string;
}

// Simple scoped rules-based responder — replace with a RAG call over your own
// thermal_index + locations tables (never open-domain).
function respond(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("safe") && q.includes("outside")) {
    return "Based on current data, check the city's risk badge: Low/Moderate is generally fine, High/Extreme means avoid outdoor exposure between 11am–4pm.";
  }
  if (q.includes("cooling center") || q.includes("cooling centre")) {
    return "Tap the emergency button (bottom-right) to see the nearest cooling centers for your location.";
  }
  return "I can help with heat-risk questions — try asking about a specific city's safety or nearby cooling centers.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Ask me about heat risk in any monitored city." },
  ]);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const botMsg: Message = { role: "bot", text: respond(input) };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-lg hover:bg-white/10"
        aria-label="Chat"
      >
        💬
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass fixed bottom-20 left-6 z-50 flex h-96 w-80 flex-col rounded-2xl p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">KIRAN Assistant</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/80">
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    m.role === "user" ? "ml-auto bg-orange-500/20 text-white/90" : "bg-white/5 text-white/70"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Is it safe in Nagpur?"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none placeholder-white/30"
              />
              <button onClick={send} className="rounded-lg bg-orange-500/80 px-3 text-xs hover:bg-orange-500">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
