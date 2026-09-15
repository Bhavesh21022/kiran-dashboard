"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "hi";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    myLocation: "My Location",
    myLocationSubtitle: "Live thermal stress for your current location.",
    nationalOverview: "National Overview",
    topRiskCities: "Top Risk Cities",
    reachNote:
      "Many at-risk populations — outdoor workers, the elderly, rural residents — don't have consistent smartphone or internet access. SMS and voice alerts extend early warning reach well beyond this app.",
  },
  hi: {
    myLocation: "मेरा स्थान",
    myLocationSubtitle: "आपके वर्तमान स्थान के लिए लाइव थर्मल स्ट्रेस डेटा।",
    nationalOverview: "राष्ट्रीय अवलोकन",
    topRiskCities: "सर्वाधिक जोखिम वाले शहर",
    reachNote:
      "कई जोखिम वाले समूहों — बाहरी श्रमिक, बुज़ुर्ग, ग्रामीण निवासी — के पास लगातार स्मार्टफोन या इंटरनेट सुविधा नहीं होती। एसएमएस और वॉइस अलर्ट चेतावनी की पहुंच ऐप से कहीं आगे तक बढ़ाते हैं।",
  },
};

// Note: this is a small hand-rolled dictionary, chosen over next-i18next
// because next-i18next targets the Pages Router. For a larger app, swap
// this provider for next-intl (which is App Router-native) without
// changing the t() call sites below.

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: string) => STRINGS[lang][key] ?? key;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
