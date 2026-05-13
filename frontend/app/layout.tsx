import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NutritionTracker',
  description: 'Urmareste-ti nutritia zilnica',
  manifest: '/manifest.json',
  appleWebApp: {   //Configurare IOS
    capable: true,
    statusBarStyle: 'default',
    title: 'NutritionTracker',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',    //Bara status verde pe mobil
  width: 'device-width',      //Responsive pe toate ecranele
  initialScale: 1,            
  maximumScale: 1,            // Dezactiveaza zoom pe mobil
};

//ServiceWorkerRegistration - activeaza PWA offline

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" /> 
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}