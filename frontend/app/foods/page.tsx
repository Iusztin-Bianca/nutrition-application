'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, UtensilsCrossed, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFoods, getFoodsCount, deleteFood, FoodItem } from '@/services/foodService';

const PAGE_SIZE = 10;

export default function FoodsPage() {
  const router = useRouter();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltipId, setTooltipId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (tooltipId === null) return;
    function close() { setTooltipId(null); }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [tooltipId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getFoods((page - 1) * PAGE_SIZE, PAGE_SIZE),
      getFoodsCount(),
    ])
      .then(([data, count]) => {
        setFoods(data);
        setTotal(count);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete() {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteFood(confirmDeleteId);
      const newTotal = total - 1;
      setTotal(newTotal);
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const targetPage = page > newTotalPages ? newTotalPages : page;
      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        const data = await getFoods((targetPage - 1) * PAGE_SIZE, PAGE_SIZE);
        setFoods(data);
      }
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function pageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  const confirmFood = foods.find(f => f.id === confirmDeleteId);

  return (
    <div className="min-h-screen bg-[#f5f0e5]">

      {/* Delete confirmation modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl shadow-xl p-7 w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Ștergi alimentul?</h2>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{confirmFood?.name}</span> va fi șters definitiv.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <p className="text-gray-500 text-sm mb-8">{total} alimente în total</p>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-10">{error}</p>}

        {!loading && foods.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
            <UtensilsCrossed className="w-12 h-12" />
            <p className="text-sm">Niciun aliment adăugat încă.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {foods.map(food => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-sm flex items-center gap-4 p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/foods/${food.id}`)}
            >
              {/* Image */}
              <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} className="w-full h-full object-contain" />
                ) : (
                  <UtensilsCrossed className="w-7 h-7 text-gray-200" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 relative">
                <p
                  className="text-sm font-semibold text-gray-900 truncate cursor-pointer select-none"
                  onClick={(e) => { e.stopPropagation(); setTooltipId(tooltipId === food.id ? null : food.id); }}
                >
                  {food.name}
                </p>
                {tooltipId === food.id && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[220px] break-words">
                    {food.name}
                  </div>
                )}
                <p className="text-xs text-[#8fc63e] font-medium mt-0.5">{food.kcal} kcal / 100g</p>
                <div className="flex gap-3 text-[11px] text-gray-400 mt-0.5">
                  <span>P {food.protein}g</span>
                  <span>C {food.carbohydrates}g</span>
                  <span>G {food.fat}g</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); router.push(`/foods/${food.id}/edit`); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(food.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-[#8fc63e] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8fc63e] hover:text-[#8fc63e]'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
