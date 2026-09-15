require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: .env.local file me Supabase keys nahi mili!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Yahan maine tumhare travel aur home locations add kar diye hain!
const CITIES = [
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Bharuch", state: "Gujarat", lat: 21.7051, lng: 72.9959 },
  { name: "Bhimakhedi", state: "Madhya Pradesh", lat: 23.6333, lng: 75.1333 },
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 }
];

async function seedData() {
    console.log("🚀 Starting KIRAN Live Data Ingestion...\n");

    for (const city of CITIES) {
        console.log(`Fetching weather for ${city.name}...`);
        
        // 1. Check if location exists in database
        let { data: existingLoc } = await supabase.from('locations').select('id').eq('name', city.name).single();
        let locationId;

        if (existingLoc) {
            locationId = existingLoc.id;
        } else {
            const { data: newLoc, error: locErr } = await supabase
                .from('locations')
                .insert({ name: city.name, state: city.state, lat: city.lat, lng: city.lng })
                .select().single();
            
            if (locErr) { console.error("Location Insert Error:", locErr.message); continue; }
            locationId = newLoc.id;
        }

        // 2. Fetch Live Weather Data
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        const data = await res.json();
        
        const temp_c = data.current.temperature_2m;
        const rh = data.current.relative_humidity_2m;
        const wind_kmh = data.current.wind_speed_10m;

        // 3. Thermal Risk Logic
        const heatIndex = temp_c + (0.5555 * (rh/100) * (temp_c - 14.5));
        let score = Math.round((heatIndex / 50) * 100);
        if (score > 100) score = 100;
        if (score < 0) score = 0;
        
        let category = "Low";
        let ndma_tier = "Green";
        if (score >= 80) { category = "Extreme"; ndma_tier = "Red"; }
        else if (score >= 60) { category = "High"; ndma_tier = "Orange"; }
        else if (score >= 40) { category = "Moderate"; ndma_tier = "Yellow"; }

        // 4. Push to Supabase Readings Table
        const { error: readErr } = await supabase
            .from('readings')
            .insert({
                location_id: locationId,
                temp_c: temp_c, 
                rh: rh, 
                wind_kmh: wind_kmh, 
                score: score, 
                category: category, 
                ndma_tier: ndma_tier
            });

        if (readErr) console.error("❌ Reading Error:", readErr.message);
        else console.log(`✅ ${city.name} saved! (Temp: ${temp_c}°C, Risk: ${category})`);
    }
    console.log("\n🎉 Done! All live data successfully pushed to Supabase!");
}

seedData();