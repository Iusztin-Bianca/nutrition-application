'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, UtensilsCrossed } from 'lucide-react';
import { getFoods, FoodItem } from '@/services/foodService';

const DIET_BADGES: { key: keyof FoodItem; label: string }[] = [
  { key: 'is_vegan', label: 'Vegan' },
  { key: 'is_vegetarian', label: 'Vegetarian' },
  { key: 'is_gluten_free', label: 'Fără gluten' },
  { key: 'is_lactose_free', label: 'Fără lactoză' },
];

const PAGE_SIZE = 50;

export default function FoodsPage() {
  const router = useRouter();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    getFoods(0, PAGE_SIZE)
      .then(data => {
        setFoods(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await getFoods(foods.length, PAGE_SIZE);
      setFoods(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5]">

      {/* Navbar */}
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
        <button onClick={() => router.push('/home')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Înapoi
        </button>
      </header>

      <main className="px-6 pb-16 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Lista Alimente</h1>
        <p className="text-gray-500 text-sm mb-8">{foods.length} alimente încărcate</p>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && foods.length === 0 && <p className="text-red-500 text-sm text-center py-10">{error}</p>}

        {!loading && foods.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
            <UtensilsCrossed className="w-12 h-12" />
            <p className="text-sm">Niciun aliment adăugat încă.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {foods.map(food => (
            <div key={food.id} className="bg-white rounded-2xl shadow-sm flex items-center gap-4 p-3">
              {/* Image */}
              <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} className="w-full h-full object-contain" />
                ) : (
                  <UtensilsCrossed className="w-7 h-7 text-gray-200" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{food.name}</p>
                <p className="text-xs text-[#8fc63e] font-medium mt-0.5">{food.kcal} kcal / 100g</p>
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  <span>Proteine {food.protein}g</span>
                  <span>Carbohidrați {food.carbohydrates}g</span>
                  <span>Grăsimi {food.fat}g</span>
                </div>
              </div>

              {/* Diet badges */}
              <div className="flex flex-wrap gap-1 justify-end flex-shrink-0 max-w-[120px]">
                {DIET_BADGES.filter(b => food[b.key]).map(b => (
                  <span key={b.key} className="text-[10px] bg-[#8fc63e]/10 text-[#8fc63e] rounded-full px-2 py-0.5 font-medium whitespace-nowrap">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 h-11 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Se încarcă...' : 'Încarcă mai multe'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
