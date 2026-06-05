'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Leaf, UtensilsCrossed } from 'lucide-react';
import { getFood, FoodResponse } from '@/services/foodService';

const DIET_LABELS: { key: keyof FoodResponse; label: string }[] = [
  { key: 'is_vegan', label: 'Vegan' },
  { key: 'is_vegetarian', label: 'Vegetarian' },
  { key: 'is_raw_vegan', label: 'Raw Vegan' },
  { key: 'is_mediterranean', label: 'Mediteranean' },
  { key: 'is_gluten_free', label: 'Fără gluten' },
  { key: 'is_lactose_free', label: 'Fără lactoză' },
  { key: 'is_fodmap', label: 'FODMAP' },
];

const MICRO_LABELS: Record<string, string> = {
  calcium: 'Calciu', magnesium: 'Magneziu', potassium: 'Potasiu', iron: 'Fier',
  zinc: 'Zinc', selenium: 'Seleniu', iodine: 'Iod', vitamin_d: 'Vitamina D',
  vitamin_a: 'Vitamina A', vitamin_c: 'Vitamina C', vitamin_e: 'Vitamina E',
  vitamin_k: 'Vitamina K', vitamin_b1: 'Vitamina B1', vitamin_b2: 'Vitamina B2',
  vitamin_b3: 'Vitamina B3', vitamin_b6: 'Vitamina B6', vitamin_b7: 'Vitamina B7',
  vitamin_b9: 'Vitamina B9', vitamin_b12: 'Vitamina B12', cholesterol: 'Colesterol',
  caffeine: 'Cafeină', alcohol: 'Alcool', omega_3: 'Omega 3', omega_6: 'Omega 6',
  copper: 'Cupru', manganese: 'Mangan',
};

function Row({ label, value, unit }: { label: string; value?: number | null; unit?: string }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}{unit}</span>
    </div>
  );
}

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [food, setFood] = useState<FoodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = Number(params.id);
    if (!id) { setError('ID invalid.'); setLoading(false); return; }
    getFood(id)
      .then(setFood)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-[#f5f0e5]">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#8fc63e] rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-gray-900">Nutrition </span>
            <span className="text-[#8fc63e]">Tracker</span>
          </span>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Înapoi
        </button>
      </header>

      <main className="px-6 pb-16 max-w-2xl mx-auto">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-10">{error}</p>}

        {food && (
          <div className="flex flex-col gap-5">
            {/* Header card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 flex items-center gap-5">
              <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} className="w-full h-full object-contain" />
                ) : (
                  <UtensilsCrossed className="w-10 h-10 text-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 break-words">{food.name}</h1>
                {food.description && (
                  <p className="text-sm text-gray-500 mt-1">{food.description}</p>
                )}
                <p className="text-[#8fc63e] font-semibold mt-2">{food.kcal} kcal / 100g</p>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Macronutrienți</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Proteine', value: food.protein },
                  { label: 'Carbohidrați', value: food.carbohydrates },
                  { label: 'Grăsimi', value: food.fat },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f5f0e5] rounded-2xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{value}g</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {food.sugars != null && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Carbohidrați</p>
                  <div className="ml-3 pl-3 border-l-2 border-gray-100">
                    <Row label="din care zaharuri" value={food.sugars} unit="g" />
                  </div>
                </div>
              )}

              {(food.saturated_fat != null || food.polyunsat_fat != null || food.monounsat_fat != null || food.trans_fat != null) && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Grăsimi</p>
                  <div className="ml-3 pl-3 border-l-2 border-gray-100">
                    <Row label="saturate" value={food.saturated_fat} unit="g" />
                    <Row label="polinesaturate" value={food.polyunsat_fat} unit="g" />
                    <Row label="mononesaturate" value={food.monounsat_fat} unit="g" />
                    <Row label="trans" value={food.trans_fat} unit="g" />
                  </div>
                </div>
              )}
            </div>

            {/* Other nutrients */}
            {(food.fiber != null || food.water != null || food.salt != null || food.sodium != null || food.glycemic_index != null) && (
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Altele</p>
                <Row label="Fibre" value={food.fiber} unit="g" />
                <Row label="Apă" value={food.water} unit="g" />
                <Row label="Sare" value={food.salt} unit="g" />
                <Row label="Sodiu" value={food.sodium} unit="mg" />
                <Row label="Indice glicemic" value={food.glycemic_index} />
              </div>
            )}

            {/* Diet flags */}
            {DIET_LABELS.some(({ key }) => food[key]) && (
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Diete compatibile</p>
                <div className="flex flex-wrap gap-2">
                  {DIET_LABELS.filter(({ key }) => food[key]).map(({ label }) => (
                    <span key={label} className="px-3 py-1.5 bg-[#8fc63e]/10 text-[#8fc63e] text-xs font-medium rounded-xl">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Micronutrients */}
            {food.micronutrients.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Micronutrienți</p>
                {food.micronutrients.map(m => (
                  <Row key={m.nutrient} label={MICRO_LABELS[m.nutrient] ?? m.nutrient} value={Number(m.amount)} unit="mg" />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
