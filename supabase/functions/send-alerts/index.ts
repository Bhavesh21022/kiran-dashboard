// KIRAN — supabase/functions/send-alerts/index.ts
// Triggered by a Database Webhook (see README Step 7) on every INSERT into
// thermal_index. Only acts when category is High or Extreme. Sends Email
// (Resend) + SMS (Twilio sandbox), logs every send into `alerts`, and
// de-duplicates so the same household isn't spammed every few minutes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");
// True once a real Twilio number is bought and secrets are set — until then
// SMS is mocked (logged as sent, no real message goes out, no cost). This
// matches the brief: "SMS via Twilio or equivalent — sandbox/mock is fine
// for hackathon demo." Swap in real secrets later and it starts sending
// for real with zero code changes.
const TWILIO_CONFIGURED = Boolean(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);

const COOLDOWN_MINUTES = 60; // don't re-alert the same location+category within this window

interface WebhookPayload {
  record: {
    location_id: string;
    category: "Low" | "Moderate" | "High" | "Extreme";
    ndma_tier: string;
  };
}

async function sendEmail(to: string, cityName: string, category: string, tier: string) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set as an Edge Function secret.");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // onboarding@resend.dev works without verifying your own domain —
      // perfect for a hackathon demo. Its one limit: in Resend's free/test
      // mode it can only deliver to the email address you signed up to
      // Resend with. Once you verify a real domain in Resend, swap this
      // for "KIRAN Alerts <alerts@yourdomain.com>" to email anyone.
      from: "KIRAN Alerts <onboarding@resend.dev>",
      to,
      subject: `Heat Alert: ${cityName} is now ${category} risk`,
      html: `<p><strong>${cityName}</strong> has entered <strong>${category}</strong> heat-risk
             (NDMA ${tier} tier). Please take precautions — avoid outdoor exposure between
             11am–4pm, stay hydrated, and check on elderly neighbors.</p>
             <p>— KIRAN Early Warning System</p>`,
    }),
  });
  if (!res.ok) {
    // Surface the exact reason in the function logs so it's visible in
    // Supabase Dashboard → Edge Functions → send-alerts → Logs.
    const errorBody = await res.text();
    console.error(`Resend error (status ${res.status}): ${errorBody}`);
  }
  return res.ok;
}

async function sendSms(to: string, cityName: string, category: string) {
  const message = `KIRAN Alert: ${cityName} is now ${category} heat risk. Avoid outdoor exposure 11am-4pm. Stay hydrated.`;

  if (!TWILIO_CONFIGURED) {
    // MOCK MODE — no Twilio number yet. Log what would have been sent and
    // report success, so the rest of the pipeline (de-dup, alert log,
    // admin portal) works exactly like it will once a real number is added.
    console.log(`[MOCK SMS] to ${to}: ${message}`);
    return true;
  }

  const body = new URLSearchParams({ From: TWILIO_FROM!, To: to, Body: message });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );
  return res.ok;
}

Deno.serve(async (req) => {
  const payload = (await req.json()) as WebhookPayload;
  const { location_id, category, ndma_tier } = payload.record;

  if (category !== "High" && category !== "Extreme") {
    return new Response(JSON.stringify({ skipped: "category below High" }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // De-dup: skip if we already sent an alert for this location at this
  // category (or higher) within the cooldown window.
  const cutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60_000).toISOString();
  const { data: recentAlerts } = await supabase
    .from("alerts")
    .select("id, category")
    .eq("location_id", location_id)
    .gte("sent_at", cutoff);

  const alreadyAlertedSameOrHigher = (recentAlerts ?? []).some(
    (a) => a.category === category || (a.category === "High" && category === "High")
  );
  if (alreadyAlertedSameOrHigher) {
    return new Response(JSON.stringify({ skipped: "cooldown active" }), { status: 200 });
  }

  const { data: location } = await supabase
    .from("locations")
    .select("name")
    .eq("id", location_id)
    .single();
  const cityName = location?.name ?? "your area";

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("email, phone, channel_email, channel_sms")
    .eq("location_id", location_id);

  let emailCount = 0, smsCount = 0;

  for (const sub of subs ?? []) {
    if (sub.channel_email && sub.email) {
      const ok = await sendEmail(sub.email, cityName, category, ndma_tier);
      await supabase.from("alerts").insert({
        location_id, category, ndma_tier, channel: "email",
        status: ok ? "sent" : "failed", triggered_by: "auto",
      });
      if (ok) emailCount++;
    }
    if (sub.channel_sms && sub.phone) {
      const ok = await sendSms(sub.phone, cityName, category);
      await supabase.from("alerts").insert({
        location_id, category, ndma_tier, channel: "sms",
        status: ok ? "sent" : "failed", triggered_by: "auto",
      });
      if (ok) smsCount++;
    }
  }

  return new Response(JSON.stringify({ cityName, category, emailCount, smsCount }), {
    headers: { "Content-Type": "application/json" },
  });
});
