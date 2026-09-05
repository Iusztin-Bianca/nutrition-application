'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Leaf, UtensilsCrossed, Save, ArrowLeft, CheckCircle, XCircle,
  ImagePlus, X, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFood, updateFood, uploadFoodImage, checkFoodName } from '@/services/foodService';

const DIET_FLAGS = [
  { key: 'is_vegan', label: 'Vegan' },
  { key: 'is_vegetarian', label: 'Vegetarian' },
  { key: 'is_raw_vegan', label: 'Raw Vegan' },
  { key: 'is_mediterranean', label: 'Mediteranean' },
  { key: 'is_gluten_free', label: 'Fără gluten' },
  { key: 'is_lactose_free', label: 'Fără lactoză' },
  { key: 'is_fodmap', label: 'FODMAP' },
  { key: 'is_anti_inflammatory', label: 'Anti-inflamatorie' },
] as const;

type DietFlagKey = (typeof DIET_FLAGS)[number]['key'];

const MICRONUTRIENTS = [
  { key: 'calcium', label: 'Calciu (mg)' },
  { key: 'magnesium', label: 'Magneziu (mg)' },
  { key: 'potassium', label: 'Potasiu (mg)' },
  { key: 'iron', label: 'Fier (mg)' },
  { key: 'zinc', label: 'Zinc (mg)' },
  { key: 'selenium', label: 'Seleniu (mg)' },
  { key: 'iodine', label: 'Iod (mg)' },
  { key: 'vitamin_d', label: 'Vitamina D (mg)' },
  { key: 'vitamin_a', label: 'Vitamina A (mg)' },
  { key: 'vitamin_c', label: 'Vitamina C (mg)' },
  { key: 'vitamin_e', label: 'Vitamina E (mg)' },
  { key: 'vitamin_k', label: 'Vitamina K (mg)' },
  { key: 'vitamin_b1', label: 'Vitamina B1 - Tiamină (mg)' },
  { key: 'vitamin_b2', label: 'Vitamina B2 - Riboflavină (mg)' },
  { key: 'vitamin_b3', label: 'Vitamina B3 - Niacină (mg)' },
  { key: 'vitamin_b6', label: 'Vitamina B6 (mg)' },
  { key: 'vitamin_b7', label: 'Vitamina B7 - Biotină (mg)' },
  { key: 'vitamin_b9', label: 'Vitamina B9 - Folat (mg)' },
  { key: 'vitamin_b12', label: 'Vitamina B12 (mg)' },
  { key: 'cholesterol', label: 'Colesterol (mg)' },
  { key: 'caffeine', label: 'Cafeină (mg)' },
  { key: 'alcohol', label: 'Alcool (mg)' },
  { key: 'omega_3', label: 'Omega 3 (mg)' },
  { key: 'omega_6', label: 'Omega 6 (mg)' },
  { key: 'copper', label: 'Cupru (mg)' },
  { key: 'manganese', label: 'Mangan (mg)' },
  { key: 'phosphorus', label: 'Fosfor (mg)' },
] as const;

type MicronutrientKey = (typeof MICRONUTRIENTS)[number]['key'];

interface FormState {
  name: string; description: string;
  kcal: string; protein: string; carbohydrates: string; sugars: string;
  fat: string; saturated_fat: string; polyunsat_fat: string; monounsat_fat: string; trans_fat: string;
  fiber: string; water: string; salt: string; sodium: string; glycemic_index: string;
}

export default function EditFoodPage() {
  const router = useRouter();
  const params = useParams();
  const foodId = Number(params.id);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({
    name: '', description: '',
    kcal: '', protein: '', carbohydrates: '', sugars: '',
    fat: '', saturated_fat: '', polyunsat_fat: '', monounsat_fat: '', trans_fat: '',
    fiber: '', water: '', salt: '', sodium: '', glycemic_index: '',
  });
  const [dietFlags, setDietFlags] = useState<Record<DietFlagKey, boolean>>({
    is_vegan: false, is_vegetarian: false, is_raw_vegan: false,
    is_mediterranean: false, is_gluten_free: false, is_lactose_free: false, is_fodmap: false,
    is_anti_inflammatory: false,
  });
  const [selectedMicros, setSelectedMicros] = useState<{ key: MicronutrientKey; amount: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [nameExists, setNameExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!foodId) { setLoadError('ID invalid.'); setInitialLoading(false); return; }
    getFood(foodId)
      .then(food => {
        setForm({
          name: food.name,
          description: food.description ?? '',
          kcal: String(food.kcal),
          protein: String(food.protein),
          carbohydrates: String(food.carbohydrates),
          sugars: food.sugars != null ? String(food.sugars) : '',
          fat: String(food.fat),
          saturated_fat: food.saturated_fat != null ? String(food.saturated_fat) : '',
          polyunsat_fat: food.polyunsat_fat != null ? String(food.polyunsat_fat) : '',
          monounsat_fat: food.monounsat_fat != null ? String(food.monounsat_fat) : '',
          trans_fat: food.trans_fat != null ? String(food.trans_fat) : '',
          fiber: food.fiber != null ? String(food.fiber) : '',
          water: food.water != null ? String(food.water) : '',
          salt: food.salt != null ? String(food.salt) : '',
          sodium: food.sodium != null ? String(food.sodium) : '',
          glycemic_index: food.glycemic_index != null ? String(food.glycemic_index) : '',
        });
        setDietFlags({
          is_vegan: food.is_vegan, is_vegetarian: food.is_vegetarian,
          is_raw_vegan: food.is_raw_vegan, is_mediterranean: food.is_mediterranean,
          is_gluten_free: food.is_gluten_free, is_lactose_free: food.is_lactose_free,
          is_fodmap: food.is_fodmap, is_anti_inflammatory: food.is_anti_inflammatory,
        });
        const validMicroKeys = MICRONUTRIENTS.map(m => m.key) as string[];
        setSelectedMicros(
          food.micronutrients
            .filter(m => validMicroKeys.includes(m.nutrient))
            .map(m => ({ key: m.nutrient as MicronutrientKey, amount: String(m.amount) }))
        );
        if (food.image_url) {
          setImagePreview(food.image_url);
          setImageUrl(food.image_url);
        }
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setInitialLoading(false));
  }, [foodId]);

  useEffect(() => {
    const trimmed = form.name.trim();
    if (!trimmed) { setNameExists(false); return; }
    const timer = setTimeout(() => {
      checkFoodName(trimmed, foodId).then(setNameExists);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.name, foodId]);

  const requiredFilled =
    form.name.trim() !== '' && !nameExists &&
    form.kcal !== '' && form.protein !== '' && form.carbohydrates !== '' && form.fat !== '';

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleFlag(key: DietFlagKey) {
    setDietFlags(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function addMicro(key: MicronutrientKey) {
    if (selectedMicros.find(m => m.key === key)) return;
    setSelectedMicros(prev => [...prev, { key, amount: '' }]);
    setDropdownOpen(false);
  }

  function removeMicro(key: MicronutrientKey) {
    setSelectedMicros(prev => prev.filter(m => m.key !== key));
  }

  function setMicroAmount(key: MicronutrientKey, amount: string) {
    setSelectedMicros(prev => prev.map(m => m.key === key ? { ...m, amount } : m));
  }

  const availableMicros = MICRONUTRIENTS.filter(m => !selectedMicros.find(s => s.key === m.key));

  async function handleSave() {
    setLoading(true);
    try {
      let finalImageUrl: string | undefined = imageUrl ?? undefined;
      if (!finalImageUrl && imageFile) {
        finalImageUrl = await uploadFoodImage(imageFile);
      }

      await updateFood(foodId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        image_url: finalImageUrl,
        kcal: parseFloat(form.kcal),
        protein: parseFloat(form.protein),
        carbohydrates: parseFloat(form.carbohydrates),
        sugars: form.sugars !== '' ? parseFloat(form.sugars) : undefined,
        fat: parseFloat(form.fat),
        saturated_fat: form.saturated_fat !== '' ? parseFloat(form.saturated_fat) : undefined,
        polyunsat_fat: form.polyunsat_fat !== '' ? parseFloat(form.polyunsat_fat) : undefined,
        monounsat_fat: form.monounsat_fat !== '' ? parseFloat(form.monounsat_fat) : undefined,
        trans_fat: form.trans_fat !== '' ? parseFloat(form.trans_fat) : undefined,
        fiber: form.fiber !== '' ? parseFloat(form.fiber) : undefined,
        water: form.water !== '' ? parseFloat(form.water) : undefined,
        salt: form.salt !== '' ? parseFloat(form.salt) : undefined,
        sodium: form.sodium !== '' ? parseFloat(form.sodium) : undefined,
        glycemic_index: form.glycemic_index !== '' ? parseInt(form.glycemic_index) : undefined,
        ...dietFlags,
        is_recipe: false,
        micronutrients: selectedMicros
          .filter(m => m.amount !== '')
          .map(m => ({ nutrient: m.key, amount: parseFloat(m.amount) })),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'border border-gray-200 rounded-xl px-3 h-11 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white';
  const labelClass = 'text-xs font-medium text-gray-500 mb-1';

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f5f0e5] flex items-center justify-center">
        <p className="text-red-500 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center py-10 px-6 gap-6">

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Modificări salvate!</h2>
            <p className="text-gray-500 text-sm text-center">Alimentul a fost actualizat cu succes.</p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push(`/foods/${foodId}`)}
            >
              Vezi detalii
            </Button>
            <button onClick={() => router.push('/foods')} className="text-sm text-gray-400 hover:text-gray-600">
              Înapoi la lista de alimente
            </button>
          </div>
        </div>
      )}

      {/* Error modal */}
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

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
            step === s ? 'bg-[#8fc63e] text-white' : step > s ? 'bg-[#8fc63e]/30 text-[#8fc63e]' : 'bg-gray-200 text-gray-400'
          }`}>{s}</div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-lg flex flex-col gap-5">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
              <ArrowLeft className="w-4 h-4" /> Înapoi
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8fc63e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-[#8fc63e]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editează aliment</h1>
                <p className="text-gray-500 text-xs mt-0.5">Valorile nutriționale sunt per 100g</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Nume */}
            <div className="flex flex-col">
              <label className={labelClass}>Nume <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className={`${inputClass} ${nameExists ? 'border-red-400 focus:border-red-400' : ''}`}
              />
              {nameExists && (
                <p className="text-xs text-red-400 mt-1">Un aliment cu acest nume există deja.</p>
              )}
            </div>

            {/* Descriere */}
            <div className="flex flex-col">
              <label className={labelClass}>Descriere</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={2}
                className="border border-gray-200 rounded-xl px-3 py-2 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white resize-none"
              />
            </div>

            {/* Imagine */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Imagine (opțional)</label>
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
                    onClick={() => { setImagePreview(null); setImageFile(null); setImageUrl(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}
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

            {/* Macros */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Macronutrienți principali *</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className={labelClass}>Calorii (kcal) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.kcal} onChange={e => set('kcal', e.target.value)} className={inputClass} />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Proteine (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.protein} onChange={e => set('protein', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label className={labelClass}>Carbohidrați (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.carbohydrates} onChange={e => set('carbohydrates', e.target.value)} className={inputClass} />
              </div>
              <div className="ml-4 pl-4 border-l-2 border-gray-100 flex flex-col">
                <label className={labelClass}>din care zaharuri (g)</label>
                <input type="number" min="0" step="0.1" value={form.sugars} onChange={e => set('sugars', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label className={labelClass}>Grăsimi (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.fat} onChange={e => set('fat', e.target.value)} className={inputClass} />
              </div>
              <div className="ml-4 pl-4 border-l-2 border-gray-100 grid grid-cols-2 gap-3">
                {([
                  { field: 'saturated_fat', label: 'Acizi grași saturați (g)' },
                  { field: 'polyunsat_fat', label: 'Acizi grași polinesaturați (g)' },
                  { field: 'monounsat_fat', label: 'Acizi grași mononesaturați (g)' },
                  { field: 'trans_fat', label: 'Acizi grași trans (g)' },
                ] as { field: keyof FormState; label: string }[]).map(({ field, label }) => (
                  <div key={field} className="flex flex-col">
                    <label className={labelClass}>{label}</label>
                    <input type="number" min="0" step="0.1" value={form[field]} onChange={e => set(field, e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Altele</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { field: 'fiber', label: 'Fibre (g)', max: undefined },
                { field: 'water', label: 'Apă (g)', max: undefined },
                { field: 'salt', label: 'Sare (g)', max: undefined },
                { field: 'sodium', label: 'Sodiu (mg)', max: undefined },
                { field: 'glycemic_index', label: 'Indice glicemic', max: 100 },
              ] as { field: keyof FormState; label: string; max: number | undefined }[]).map(({ field, label, max }) => (
                <div key={field} className="flex flex-col">
                  <label className={labelClass}>{label}</label>
                  <input
                    type="number" min="0" step="0.1" max={max}
                    value={form[field]}
                    onChange={e => {
                      const val = e.target.value;
                      if (max !== undefined && val !== '' && Number(val) > max) return;
                      set(field, val);
                    }}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <hr className="border-gray-100" />

            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setStep(2)}
              disabled={!requiredFilled}
            >
              Continuă
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
              <ArrowLeft className="w-4 h-4" /> Înapoi
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8fc63e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-[#8fc63e]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detalii suplimentare</h1>
                <p className="text-gray-500 text-xs mt-0.5">Toate câmpurile sunt opționale</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Diete compatibile</p>
            <div className="flex flex-wrap gap-2">
              {DIET_FLAGS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFlag(key)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    dietFlags[key]
                      ? 'bg-[#8fc63e] border-[#8fc63e] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#8fc63e] bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <hr className="border-gray-100" />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Micronutrienți</p>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                disabled={availableMicros.length === 0}
                className="w-full h-11 border border-gray-200 rounded-xl px-3 flex items-center justify-between text-sm text-gray-500 bg-white hover:border-[#8fc63e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{availableMicros.length === 0 ? 'Toți micronutrienții au fost adăugați' : 'Selectează micronutrient...'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-52 overflow-y-auto py-1">
                  {availableMicros.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => addMicro(key)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#8fc63e]/10 hover:text-[#8fc63e] transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedMicros.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedMicros.map(({ key, amount }) => {
                  const label = MICRONUTRIENTS.find(m => m.key === key)?.label ?? key;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1 flex flex-col">
                        <label className={labelClass}>{label}</label>
                        <input
                          type="number" min="0" step="0.001" value={amount}
                          onChange={e => setMicroAmount(key, e.target.value)}
                          placeholder="cantitate"
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMicro(key)}
                        className="mt-5 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <hr className="border-gray-100" />

            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Se salvează...' : 'Salvează modificările'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
