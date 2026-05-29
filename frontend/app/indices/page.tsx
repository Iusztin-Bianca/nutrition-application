'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ArrowLeft, Scale, Flame, Zap, Ruler } from 'lucide-react';
import { getProfile, UserDetailsResponse } from '@/services/profileService';

interface IndexCard {
  icon: React.ReactNode;
  name: string;
  description: string;
  value: number | null | undefined;
  unit: string;
  color: string;
  interpretation?: string;
}

function getImcInterpretation(imc: number): string {
  if (imc < 18.5) return 'Subponderal';
  if (imc < 25) return 'Greutate normală';
  if (imc < 30) return 'Supraponderal';
  return 'Obezitate';
}

function getImcColor(imc: number): string {
  if (imc < 18.5) return 'text-blue-500';
  if (imc < 25) return 'text-green-500';
  if (imc < 30) return 'text-orange-400';
  return 'text-red-500';
}

function getTsInterpretation(ts: number, sex: string | null | undefined): string {
  if (sex === 'F') {
    if (ts < 0.8) return 'Risc cardiovascular scăzut';
    if (ts < 0.85) return 'Risc cardiovascular moderat';
    return 'Risc cardiovascular ridicat';
  } else {
    if (ts < 0.9) return 'Risc cardiovascular scăzut';
    if (ts < 1.0) return 'Risc cardiovascular moderat';
    return 'Risc cardiovascular ridicat';
  }
}

export default function IndicesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    getProfile()
      .then(p => {
        setProfile(p);
        if (!p || p.imc == null) setNoData(true);
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards: IndexCard[] = [
    {
      icon: <Scale className="w-6 h-6" />,
      name: 'Indice Masă Corporală',
      description: 'Raportul dintre greutate și înălțime, folosit pentru a evalua dacă greutatea corporală se încadrează în limite sănătoase.',
      value: profile?.imc,
      unit: 'kg/m²',
      color: 'bg-blue-50 text-blue-600',
      interpretation: profile?.imc != null ? getImcInterpretation(profile.imc) : undefined,
    },
    {
      icon: <Flame className="w-6 h-6" />,
      name: 'Rata Metabolică Bazală',
      description: 'Numărul de calorii pe care corpul tău le arde în repaus complet pentru a menține funcțiile vitale (respirație, circulație, temperatură).',
      value: profile?.bmr,
      unit: 'kcal/zi',
      color: 'bg-orange-50 text-orange-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      name: 'Metabolism Zilnic Total',
      description: 'Totalul de calorii pe care corpul tău le necesită zilnic, luând în calcul rata metabolică bazală și nivelul tău de activitate fizică.',
      value: profile?.mzt,
      unit: 'kcal/zi',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: <Ruler className="w-6 h-6" />,
      name: 'Raport Talie / Șold',
      description: 'Raportul dintre circumferința taliei și cea a șoldului, indicator al distribuției grăsimii corporale și al riscului cardiovascular.',
      value: profile?.ts,
      unit: '',
      color: 'bg-purple-50 text-purple-600',
      interpretation: profile?.ts != null ? getTsInterpretation(profile.ts, profile?.sex) : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center py-10 px-6 gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 bg-[#8fc63e] rounded-2xl flex items-center justify-center shadow">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-gray-900">Nutrition </span>
          <span className="text-[#8fc63e]">Tracker</span>
        </span>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Înapoi
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicii tăi nutriționali</h1>
          <p className="text-gray-500 text-sm mt-1">Calculați pe baza datelor din profilul tău.</p>
        </div>

        {noData ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center flex flex-col items-center gap-3">
            <p className="text-gray-500 text-sm">
              Nu am putut calcula indicii. Asigură-te că ai completat toate câmpurile din profil.
            </p>
            <button
              onClick={() => router.push('/complete-profile?mode=edit')}
              className="text-[#8fc63e] text-sm font-medium hover:underline"
            >
              Completează profilul →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cards.map(card => (
              <div key={card.name} className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} bg-opacity-60`}>
                    {card.icon}
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{card.name}</h2>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
                <div className="flex items-end justify-between pt-1 border-t border-gray-100">
                  {card.value != null ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                      {card.unit && <span className="text-sm text-gray-400">{card.unit}</span>}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Date insuficiente</span>
                  )}
                  {card.interpretation && (
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      card.name.includes('Masă')
                        ? profile?.imc != null
                          ? `${getImcColor(profile.imc)} bg-gray-50`
                          : 'text-gray-400'
                        : 'text-purple-600 bg-purple-50'
                    }`}>
                      {card.interpretation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        🌿 Mănâncă inteligent, trăiești echilibrat — Nutrition Tracker te ghidează zi de zi.
      </p>

    </div>
  );
}
