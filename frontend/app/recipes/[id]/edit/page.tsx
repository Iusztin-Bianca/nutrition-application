'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Leaf, ArrowLeft, Search, X, Plus, Trash2, Save, CheckCircle, XCircle, ChefHat, ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFoods, getFood, FoodItem, checkFoodName, uploadFoodImage } from '@/services/foodService';
import { getRecipeIngredients, updateRecipe } from '@/services/recipeService';

interface Ingredient {
  food_id: number;
  food_name: string;
  quantity_grams: number;
  kcal_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fat_per_100: number;
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = Number(params.id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [nameExists, setNameExists] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [foodSearch, setFoodSearch] = useState('');
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [food, ings] = await Promise.all([
          getFood(recipeId),
          getRecipeIngredients(recipeId),
        ]);
        setName(food.name);
        setOriginalName(food.name);
        setDescription(food.description ?? '');
        if (food.image_url) {
          setImagePreview(food.image_url);
          setImageUrl(food.image_url);
        }
        setIngredients(ings.map(ing => ({
          food_id: ing.food_id,
          food_name: ing.food_name,
          quantity_grams: ing.quantity_grams,
          kcal_per_100: ing.food_kcal,
          protein_per_100: ing.food_protein,
          carbs_per_100: ing.food_carbohydrates,
          fat_per_100: ing.food_fat,
        })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [recipeId]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === originalName) { setNameExists(false); return; }
    const t = setTimeout(() => checkFoodName(trimmed, recipeId).then(setNameExists), 500);
    return () => clearTimeout(t);
  }, [name, originalName, recipeId]);

  useEffect(() => {
    if (!foodSearch.trim()) { setFoodResults([]); setShowDropdown(false); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await getFoods(0, 8, { search: foodSearch });
        setFoodResults(results);
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [foodSearch]);

  const totalWeight = ingredients.reduce((s, i) => s + i.quantity_grams, 0);
  const totalKcal = ingredients.reduce((s, i) => s + i.kcal_per_100 * i.quantity_grams / 100, 0);
  const totalProtein = ingredients.reduce((s, i) => s + i.protein_per_100 * i.quantity_grams / 100, 0);
  const totalCarbs = ingredients.reduce((s, i) => s + i.carbs_per_100 * i.quantity_grams / 100, 0);
  const totalFat = ingredients.reduce((s, i) => s + i.fat_per_100 * i.quantity_grams / 100, 0);
  const kcalPer100 = totalWeight > 0 ? (totalKcal / totalWeight * 100) : 0;

  function selectFood(food: FoodItem) {
    setSelectedFood(food);
    setFoodSearch(food.name);
    setShowDropdown(false);
    setFoodResults([]);
  }

  function addIngredient() {
    if (!selectedFood || !quantity || parseFloat(quantity) <= 0) return;
    if (ingredients.find(i => i.food_id === selectedFood.id)) {
      setError('Acest aliment a fost deja adăugat în rețetă.');
      return;
    }
    setIngredients(prev => [...prev, {
      food_id: selectedFood.id,
      food_name: selectedFood.name,
      quantity_grams: parseFloat(quantity),
      kcal_per_100: selectedFood.kcal,
      protein_per_100: selectedFood.protein,
      carbs_per_100: selectedFood.carbohydrates,
      fat_per_100: selectedFood.fat,
    }]);
    setSelectedFood(null);
    setFoodSearch('');
    setQuantity('');
  }

  function removeIngredient(food_id: number) {
    setIngredients(prev => prev.filter(i => i.food_id !== food_id));
  }

  async function handleSave() {
    setSaving(true);
    try {
      let finalImageUrl: string | null = imageUrl;
      if (!finalImageUrl && imageFile) {
        finalImageUrl = await uploadFoodImage(imageFile);
      }
      await updateRecipe(recipeId, {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: finalImageUrl ?? undefined,
        ingredients: ingredients.map(i => ({ food_id: i.food_id, quantity_grams: i.quantity_grams })),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const canSave = name.trim() !== '' && !nameExists && ingredients.length >= 1;
  const inputClass = 'border border-gray-200 rounded-xl px-3 h-11 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center py-10 px-6 gap-6">

      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Rețetă actualizată!</h2>
            <p className="text-gray-500 text-sm text-center">Modificările au fost salvate cu succes.</p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push('/foods')}
            >
              Vezi lista de alimente
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Eroare</h2>
            <p className="text-gray-500 text-sm text-center">{error}</p>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-11" onClick={() => setError('')}>
              OK
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 bg-[#8fc63e] rounded-2xl flex items-center justify-center shadow">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-gray-900">Nutrition </span>
          <span className="text-[#8fc63e]">Tracker</span>
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-lg flex flex-col gap-5">

        <button onClick={() => router.push('/foods')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="w-4 h-4" /> Înapoi
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8fc63e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-[#8fc63e]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Editează rețeta</h1>
            <p className="text-gray-500 text-xs mt-0.5">Nutrienții se recalculează automat din ingrediente</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Nume rețetă <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`${inputClass} ${nameExists ? 'border-red-400 focus:border-red-400' : ''}`}
          />
          {nameExists && <p className="text-xs text-red-400">O rețetă sau aliment cu acest nume există deja.</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Descriere (opțional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="border border-gray-200 rounded-xl px-3 py-2 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Imagine (opțional)</label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fn = file.name.toLowerCase();
              const ct = file.type.toLowerCase();
              const isHeic = fn.endsWith('.heic') || fn.endsWith('.heif') || ct.includes('heic') || ct.includes('heif');
              if (isHeic) {
                setImageUploading(true);
                setImagePreview(null);
                setImageFile(null);
                setImageUrl(null);
                try {
                  const url = await uploadFoodImage(file);
                  setImagePreview(url);
                  setImageUrl(url);
                } catch {
                  setError('Eroare la încărcarea imaginii.');
                } finally {
                  setImageUploading(false);
                }
              } else {
                setImagePreview(URL.createObjectURL(file));
                setImageFile(file);
                setImageUrl(null);
              }
            }}
          />
          {imageUploading ? (
            <div className="w-full h-28 border-2 border-dashed border-[#8fc63e] rounded-xl flex flex-col items-center justify-center gap-2 text-[#8fc63e]">
              <div className="w-6 h-6 border-2 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Se procesează imaginea...</span>
            </div>
          ) : imagePreview ? (
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setImageUrl(null);
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Apasă pentru a încărca o imagine</span>
            </button>
          )}
        </div>

        <hr className="border-gray-100" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ingrediente</p>

        <div className="flex flex-col gap-3">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={foodSearch}
                onChange={e => { setFoodSearch(e.target.value); setSelectedFood(null); }}
                placeholder="Caută aliment..."
                className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white"
              />
              {foodSearch && (
                <button
                  onClick={() => { setFoodSearch(''); setSelectedFood(null); setFoodResults([]); setShowDropdown(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-52 overflow-y-auto py-1">
                {searchLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : foodResults.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Niciun aliment găsit.</p>
                ) : (
                  foodResults.map(food => (
                    <button
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#8fc63e]/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.kcal} kcal · P {food.protein}g · C {food.carbohydrates}g · G {food.fat}g</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedFood && (
            <div className="flex gap-2 items-end">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Cantitate (grame)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIngredient()}
                  placeholder="ex: 150"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <button
                onClick={addIngredient}
                disabled={!quantity || parseFloat(quantity) <= 0}
                className="h-11 px-4 bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Adaugă
              </button>
            </div>
          )}
        </div>

        {ingredients.length > 0 && (
          <div className="flex flex-col gap-2">
            {ingredients.map(ing => {
              const kcal = ing.kcal_per_100 * ing.quantity_grams / 100;
              const protein = ing.protein_per_100 * ing.quantity_grams / 100;
              const carbs = ing.carbs_per_100 * ing.quantity_grams / 100;
              const fat = ing.fat_per_100 * ing.quantity_grams / 100;
              return (
                <div key={ing.food_id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ing.food_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ing.quantity_grams}g · {kcal.toFixed(0)} kcal · P {protein.toFixed(1)}g · C {carbs.toFixed(1)}g · G {fat.toFixed(1)}g
                    </p>
                  </div>
                  <button
                    onClick={() => removeIngredient(ing.food_id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="bg-[#f0f8e0] rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#8fc63e] uppercase tracking-wide">Nutriție totală rețetă ({totalWeight.toFixed(0)}g)</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-3 flex flex-col">
                <span className="text-[11px] text-gray-400">Calorii totale</span>
                <span className="text-lg font-bold text-gray-900">{totalKcal.toFixed(0)} kcal</span>
              </div>
              <div className="bg-white rounded-xl p-3 flex flex-col">
                <span className="text-[11px] text-gray-400">Stocat la 100g</span>
                <span className="text-lg font-bold text-[#8fc63e]">{kcalPer100.toFixed(0)} kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Proteine', value: totalProtein },
                { label: 'Carbohidrați', value: totalCarbs },
                { label: 'Grăsimi', value: totalFat },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value.toFixed(1)}g</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-100" />

        <Button
          className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Se salvează...' : 'Salvează modificările'}
        </Button>

      </div>
    </div>
  );
}
