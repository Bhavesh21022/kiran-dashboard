// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MenuProvider } from "@/lib/MenuContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const accuracyData = [
  { epoch: "10", accuracy: 82 },
  { epoch: "20", accuracy: 87 },
  { epoch: "30", accuracy: 91 },
  { epoch: "40", accuracy: 94 },
  { epoch: "50", accuracy: 96.5 },
];

export default function ModelPerformancePage() {
  return (
    <MenuProvider>
      <main className="min-h-screen font-body relative bg-gray-950 text-white">
        <Navbar nationalAvgCategory="Moderate" locations={[]} onSelectLocation={() => {}} />
        <Sidebar />
        
        <div className="px-4 pb-24 pt-28 sm:pl-64 sm:pr-8 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              ⚙️ AI Model Performance
            </h1>
            <p className="text-gray-400 mt-2">Live metrics for the Thermal Stress Prediction Engine (v2.4).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-xl text-center">
              <h3 className="text-gray-400 mb-2">Current Accuracy</h3>
              <p className="text-5xl font-black text-green-400">96.5%</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-xl text-center">
              <h3 className="text-gray-400 mb-2">Prediction Latency</h3>
              <p className="text-5xl font-black text-blue-400">120ms</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-6 rounded-2xl shadow-xl text-center">
              <h3 className="text-gray-400 mb-2">False Positive Rate</h3>
              <p className="text-5xl font-black text-red-400">1.2%</p>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Model Training Accuracy Over Epochs</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="epoch" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} domain={[70, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#818cf8" strokeWidth={4} dot={{ r: 6, fill: '#818cf8' }} name="Accuracy (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </MenuProvider>
  );
}