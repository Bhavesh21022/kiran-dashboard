# KIRAN — Phase 2 Setup Guide (Backend, Alerts, Admin Portal)

Isse pehle Phase 1 (frontend scaffold) already chal raha hona chahiye
(`npm install` + `npm run dev`). Ab hum real backend jodenge.

---

## STEP 1 — Supabase project banao

1. https://supabase.com par jaake free account banao, "New Project" click karo.
2. Project name `kiran`, ek strong database password set karo (save kar lena),
   region **South Asia (Mumbai)** choose karo (India ke liye fastest).
3. Project ban jaane ke baad, left sidebar me **Project Settings → API** kholo.
   Yahan se 2 cheezein copy karo:
   - `Project URL`
   - `anon public` key

## STEP 2 — Database schema banao

1. Left sidebar me **SQL Editor** kholo → **New query**.
2. Is project ke `supabase/schema.sql` file ka poora content copy-paste karo.
3. **Run** dabao. Ye 6 tables banayega (`locations`, `thermal_index`,
   `subscriptions`, `alerts`, `admin_profiles`, `model_performance`) + RLS
   policies + 7 starter cities seed kar dega.
4. **Table Editor** me jaake check kar lo — `locations` table me 7 rows
   dikhni chahiye.

## STEP 3 — Frontend ko Supabase se jodo

1. Project root me `.env.example` ko copy karke `.env.local` banao:
   ```bash
   cp .env.example .env.local
   ```
2. `.env.local` khol ke `NEXT_PUBLIC_SUPABASE_URL` aur
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` me Step 1 wali values paste karo.
3. `npm run dev` restart karo. Ab bhi map pe mock data dikhega kyunki
   `thermal_index` table abhi khaali hai — agla step isko bharega.

## STEP 4 — Supabase CLI install karo (Edge Functions deploy karne ke liye)

```bash
npm install -g supabase
supabase login
```

Project root me:
```bash
supabase link --project-ref your-project-ref
```
(`your-project-ref` Project Settings → General me milega, URL me bhi hota hai:
`https://<project-ref>.supabase.co`)

## STEP 5 — Edge Function secrets set karo

Terminal me (apni real values ke saath):
```bash
supabase secrets set RESEND_API_KEY=re_xxx
```
(Resend: resend.com pe free account, API key mil jaayegi — ye zaroori hai, email alerts isi se jaate hain.)

**Twilio (SMS) — optional hai, agar phone number afford na ho to skip karo:**
```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxx
supabase secrets set TWILIO_FROM_NUMBER=+1xxxxxxxxxx
```
Agar ye 3 secrets set nahi karoge, to `send-alerts` function apne aap **"mock mode"** me chala jaayega — SMS bhejne ka poora flow (de-dup, alert log, admin portal) waise hi kaam karega, bas real SMS nahi jaayega (sirf function logs me "[MOCK SMS] ..." dikhega). Ye hackathon demo ke liye bilkul valid hai. Baad me jab number mil jaaye, bas ye 3 commands chala dena — code me kuch badalna nahi padega.

`SUPABASE_URL` aur `SUPABASE_SERVICE_ROLE_KEY` Edge Functions ko automatically
mil jaate hain — inhe manually set karne ki zaroorat nahi.

## STEP 6 — Edge Functions deploy karo

```bash
supabase functions deploy ingest-weather
supabase functions deploy send-alerts
```

Test karne ke liye `ingest-weather` ko manually call karo:
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/ingest-weather \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
Ab **Table Editor → thermal_index** me jaake check karo — har location ke
liye ek row aa jaani chahiye, real Open-Meteo data ke saath.

## STEP 7 — Ingest ko schedule karo (har 15-30 min me)

Supabase Dashboard → **Database → Cron Jobs** (ya SQL Editor me `pg_cron`
extension enable karke) → naya cron job banao jo har 15 minute me
`ingest-weather` function ko HTTP call kare. (Free tier me Cron Jobs feature
available hai; agar na dikhe to `pg_cron` + `pg_net` extensions Database →
Extensions se enable karo aur SQL se schedule karo.)

## STEP 8 — Automated alerts wire karo (Database Webhook)

1. Dashboard → **Database → Webhooks** → **Create a new webhook**.
2. Table: `thermal_index`, Event: `Insert`.
3. Type: **Supabase Edge Function** → function select karo: `send-alerts`.
4. Save karo.

Ab jab bhi `ingest-weather` ek naya row insert karega jiska category High ya
Extreme ho, `send-alerts` automatically chalega — subscribed users ko
email/SMS jayega, aur `alerts` table me log ho jaayega (with de-dup cooldown).

## STEP 9 — Admin Portal ke liye ek admin user banao

1. Dashboard → **Authentication → Users → Add user** → apna email/password
   daal ke banao.
2. SQL Editor me (us user ki `id` UUID copy karke):
   ```sql
   insert into admin_profiles (user_id, jurisdiction, display_name)
   values ('paste-user-id-here', 'general', 'Demo Admin');
   ```
   `jurisdiction = 'general'` matlab sabhi locations dikhengi; kisi specific
   state tak limit karna ho to `locations` table ke `jurisdiction` column ki
   value use karo (e.g. `'maharashtra'`).
3. App me `/admin` route par jaake usi email/password se login karo.

## STEP 10 — Poora flow test karo

1. `npm run dev` → homepage pe kisi city pe click karo → detail panel khulega.
2. "Email" toggle on karo, apna email daalo, "Confirm subscription" dabao.
3. Manually ek High/Extreme reading insert karo test ke liye (SQL Editor):
   ```sql
   insert into thermal_index (location_id, temp_c, rh, wind_kmh, score, heat_index_c, category, ndma_tier)
   select id, 47, 20, 5, 95, 50, 'Extreme', 'Red' from locations where name = 'Nagpur';
   ```
4. Kuch second me tumhe email aana chahiye (Resend dashboard me bhi log
   dikhega), aur `/admin` ke Alert Log me entry aa jaani chahiye.

## STEP 11 — Deploy (optional, demo ke liye)

Frontend ke liye sabse aasaan: [vercel.com](https://vercel.com) → GitHub repo
import karo → Environment Variables me `NEXT_PUBLIC_SUPABASE_URL` aur
`NEXT_PUBLIC_SUPABASE_ANON_KEY` daalo → Deploy. Edge Functions already
Supabase pe live hain, kuch alag deploy nahi karna.

---

## Ab tak kya ready hai (Phase 1 + 2 combined)

- Full premium dark-glass UI, Sun Companion, gauges, maps
- Real Supabase backend: locations, live thermal readings, subscriptions, alerts
- Automated email + SMS alerts on High/Extreme, with de-dup cooldown
- Admin Portal: login, jurisdiction-scoped view, manual alert broadcast, alert log
- Real browser Geolocation for "My Location"
- Hindi/English language toggle
- PWA service worker caching last-fetched risk data for offline view

## Phase 3 — agla step (bologe to banayenge)

- Vulnerable-Group Mode (Elderly/Outdoor Worker/Child/Pregnant toggle adjusting thresholds)
- Shareable Risk Card (image/PDF export for WhatsApp/panchayat)
- Compare Locations (side-by-side 2 cities)
- About page with animated pipeline diagram
- Model Performance charts wired to real `model_performance` data
- Voice/read-aloud mode
- ML-based forecast layer (beyond current-conditions TSI)
