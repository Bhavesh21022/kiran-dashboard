import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AmbientBackground from "@/components/AmbientBackground";
import SplashGate from "@/components/SplashGate";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KIRAN — Heatwave Early Warning",
  description:
    "Extreme Heatwave Early Warning & Human Thermal Stress Index — SIH26083, Ministry of Earth Sciences",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <I18nProvider>
          <ServiceWorkerRegister />
          <AmbientBackground />
          <SplashGate>
            <div className="relative z-10">{children}</div>
          </SplashGate>
        </I18nProvider>
      </body>
    </html>
  );
}
