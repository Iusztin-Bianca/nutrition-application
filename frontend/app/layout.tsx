import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'NutritionTracker - Nutriție pentru o viață sănătoasă',
  description: 'Aplicație de nutriție pentru urmărirea caloriilor, planificarea meselor și un stil de viață sănătos.',
  manifest: '/manifest.json',
  appleWebApp: {   //Configurare IOS
    capable: true,
    statusBarStyle: 'default',
    title: 'NutritionTracker',
  }
};

export const viewport: Viewport = {
  width: 'device-width',      //Responsive pe toate ecranele
  themeColor: '#8fc63e',
  initialScale: 1,            
  maximumScale: 1,            // Dezactiveaza zoom pe mobil
};

//ServiceWorkerRegistration - activeaza PWA offline

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro" className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8BC34A" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}