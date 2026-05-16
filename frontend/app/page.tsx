'use client';

import { useRouter } from 'next/navigation';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center justify-between py-10 px-6">

      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 bg-[#8fc63e] rounded-2xl flex items-center justify-center shadow">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-gray-900">Nutrition </span>
          <span className="text-[#8fc63e]">Tracker</span>
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Bun venit!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Nutriția ta inteligentă,{' '}
            <span className="text-[#8fc63e] font-medium">la un click distanță.</span>
          </p>
        </div>

        <Button
          className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12"
          onClick={() => router.push('/login')}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Logare
        </Button>

        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 border-gray-200"
          onClick={() => router.push('/register')}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Creare User Nou
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        🌿 Mănâncă inteligent, trăiește echilibrat — Nutrition Tracker te ghidează zi de zi.
      </p>

    </div>
  );
}
