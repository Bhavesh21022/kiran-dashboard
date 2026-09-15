# KIRAN — Setup Guide (Phase 1: Frontend Scaffold)

Yeh Phase 1 hai — poore premium UI ka working scaffold, real Thermal Stress Index
formula ke saath (mock data pe). Phase 2 me Supabase backend, alerts, admin portal
jodenge.

## 1. Folder structure (already banaya hua hai is zip me)

```
kiran-app/
├── app/                  → pages (Next.js App Router)
│   ├── layout.tsx        → root layout, fonts
│   ├── page.tsx          → main dashboard (sab components yahin jud rahe hain)
│   └── globals.css       → dark glass theme
├── components/           → sab UI pieces alag-alag files me
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   ├── Sidebar.tsx
│   ├── SunCompanion.tsx  → animated glowing sun
│   ├── ThermalGauge.tsx  → animated gauge
│   ├── CityDetailPanel.tsx
│   ├── TopRiskCities.tsx
│   ├── MapView.tsx       → India map (react-leaflet)
│   ├── EmergencyButton.tsx
│   └── Chatbot.tsx
├── lib/
│   └── thermalIndex.ts   → TSI formula (frontend copy, display-only)
├── backend/
│   └── thermal_index.py  → TSI formula, SOURCE OF TRUTH for backend
├── public/manifest.json  → PWA manifest
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 2. VS Code me kaise kholein

1. Is zip ko extract karo kisi bhi folder me, jaise `Desktop/kiran-app`.
2. VS Code kholo → `File → Open Folder` → `kiran-app` select karo.
3. VS Code ka built-in terminal kholo: `Terminal → New Terminal` (ya `` Ctrl+` ``).

## 3. Install & run (terminal me ye commands chalao, ek-ek karke)

```bash
node -v          # Node.js 18+ hona chahiye, nahi hai to nodejs.org se install karo
npm install
npm run dev
```

Terminal me `http://localhost:3000` link aayega — Ctrl+click karke browser me kholo.
App usme live dikhega, mock data ke saath.

## 4. Formula kaise kaam karta hai

`lib/thermalIndex.ts` (frontend) aur `backend/thermal_index.py` (backend) dono me
**exact same** Heat Index formula hai — India ke liye humidity-tolerance adjust
kiya hua. Ye ek 0–100 score aur Low/Moderate/High/Extreme category deta hai,
jo IMD/NDMA ke Yellow/Orange/Red tiers se map hota hai.

Test karna ho to:
```bash
python3 backend/thermal_index.py
```

## 5. Ab tak kya ready hai (Phase 1)

- Poora dark glassmorphism UI, Navbar + Search + Sidebar
- India Map (mock cities ke saath)
- Sun Companion — risk ke hisaab se color/mood/message badalta hai
- City Detail Panel — gauge, trend chart, alert-subscribe UI (abhi backend se juda nahi)
- Top Risk Cities cards, Emergency button, Chatbot (rules-based abhi)
- TSI formula dono jagah (frontend + backend Python)

## 6. Phase 2 — abhi baaki hai (agle message me bana sakte hain)

- Supabase project setup: `locations`, `thermal_index`, `alerts`, `subscriptions` tables
- Real weather data fetch (Open-Meteo/IMD) → Supabase Edge Function jo
  `backend/thermal_index.py` wali logic se score calculate karke store kare
- Database Webhook → Email (Resend) + SMS (Twilio sandbox) automated alerts
- Admin Portal route (`/admin`) with mock login
- Real Geolocation API integration for "My Location"
- next-i18next multilingual setup (Hindi/English + regional)
- Service Worker for PWA offline caching
- Shareable risk card (image/PDF export)
- Compare Locations page

Jab ye ready ho jaye to bologe "phase 2 shuru karo", main Supabase schema +
Edge Function + alert system ka code de dunga isi tarah step-by-step.
