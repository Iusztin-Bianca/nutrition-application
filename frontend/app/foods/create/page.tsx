'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, UtensilsCrossed, Save, ArrowLeft, CheckCircle, XCircle,
  ImagePlus, Camera, X, ChevronDown, ChevronRight, ScanLine, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFood, uploadFoodImage, checkFoodName, scanFoodLabel, scanBookPage } from '@/services/foodService';

const DIET_FLAGS = [
  { key: 'is_vegan', label: 'Vegan' },
  { key: 'is_vegetarian', label: 'Vegetarian' },
  { key: 'is_raw_vegan', label: 'Raw Vegan' },
  { key: 'is_mediterranean', label: 'Mediteranean' },
  { key: 'is_gluten_free', label: 'Fără gluten' },
  { key: 'is_lactose_free', label: 'Fără lactoză' },
  { key: 'is_fodmap', label: 'FODMAP' },
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
  name: string;
  description: string;
  kcal: string;
  protein: string;
  carbohydrates: string;
  sugars: string;
  fat: string;
  saturated_fat: string;
  polyunsat_fat: string;
  monounsat_fat: string;
  trans_fat: string;
  fiber: string;
  water: string;
  salt: string;
  sodium: string;
  glycemic_index: string;
}

const emptyForm: FormState = {
  name: '', description: '',
  kcal: '', protein: '', carbohydrates: '', sugars: '',
  fat: '', saturated_fat: '', polyunsat_fat: '', monounsat_fat: '', trans_fat: '',
  fiber: '', water: '', salt: '', sodium: '', glycemic_index: '',
};

const emptyFlags: Record<DietFlagKey, boolean> = {
  is_vegan: false, is_vegetarian: false, is_raw_vegan: false,
  is_mediterranean: false, is_gluten_free: false, is_lactose_free: false, is_fodmap: false,
};

export default function CreateFoodPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dietFlags, setDietFlags] = useState<Record<DietFlagKey, boolean>>(emptyFlags);
  const [selectedMicros, setSelectedMicros] = useState<{ key: MicronutrientKey; amount: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const scanCameraInputRef = useRef<HTMLInputElement>(null);
  const bookScanInputRef = useRef<HTMLInputElement>(null);
  const bookScanCameraInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [bookScanning, setBookScanning] = useState(false);
  const [scannedFields, setScannedFields] = useState<Set<string>>(new Set());

  const VALID_MICRO_KEYS = new Set(MICRONUTRIENTS.map(m => m.key));
  function isValidMicroKey(key: string): key is MicronutrientKey {
    return VALID_MICRO_KEYS.has(key as MicronutrientKey);
  }
  const [nameExists, setNameExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmed = form.name.trim();
    if (!trimmed) { setNameExists(false); return; }
    const timer = setTimeout(() => {
      checkFoodName(trimmed).then(setNameExists);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.name]);

  const requiredFilled =
    form.name.trim() !== '' &&
    !nameExists &&
    form.kcal !== '' &&
    form.protein !== '' &&
    form.carbohydrates !== '' &&
    form.fat !== '';

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

  async function handleScanLabel(file: File) {
    setScanning(true);
    try {
      const result = await scanFoodLabel(file);
      const filled = new Set<string>();
      const updates: Partial<FormState> = {};
      if (result.kcal != null)           { updates.kcal = String(result.kcal);                   filled.add('kcal'); }
      if (result.protein != null)        { updates.protein = String(result.protein);              filled.add('protein'); }
      if (result.carbohydrates != null)  { updates.carbohydrates = String(result.carbohydrates);  filled.add('carbohydrates'); }
      if (result.sugars != null)         { updates.sugars = String(result.sugars);                filled.add('sugars'); }
      if (result.fat != null)            { updates.fat = String(result.fat);                      filled.add('fat'); }
      if (result.saturated_fat != null)  { updates.saturated_fat = String(result.saturated_fat);  filled.add('saturated_fat'); }
      if (result.fiber != null)          { updates.fiber = String(result.fiber);                  filled.add('fiber'); }
      if (result.salt != null)           { updates.salt = String(result.salt);                    filled.add('salt'); }
      if (result.sodium != null)         { updates.sodium = String(result.sodium);                filled.add('sodium'); }
      if (Object.keys(updates).length === 0) {
        setError('Nu s-au găsit valori nutriționale în imagine. Încearcă o poză mai clară.');
        return;
      }
      setForm(prev => ({ ...prev, ...updates }));
      setScannedFields(filled);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleScanBook(file: File) {
    setBookScanning(true);
    try {
      const result = await scanBookPage(file);
      const filled = new Set<string>(scannedFields);
      const updates: Partial<FormState> = {};
      if (result.name)               { updates.name = result.name;                           filled.add('name'); }
      if (result.kcal != null)       { updates.kcal = String(result.kcal);                   filled.add('kcal'); }
      if (result.protein != null)    { updates.protein = String(result.protein);              filled.add('protein'); }
      if (result.carbohydrates != null) { updates.carbohydrates = String(result.carbohydrates); filled.add('carbohydrates'); }
      if (result.fat != null)        { updates.fat = String(result.fat);                     filled.add('fat'); }
      if (result.fiber != null)      { updates.fiber = String(result.fiber);                  filled.add('fiber'); }
      if (result.water != null)      { updates.water = String(result.water);                  filled.add('water'); }
      if (result.sodium != null)     { updates.sodium = String(result.sodium);                filled.add('sodium'); }
      if (Object.keys(updates).length === 0 && !result.micronutrients?.length) {
        setError('Nu s-au găsit date nutriționale în imagine.');
        return;
      }
      setForm(prev => ({ ...prev, ...updates }));
      setScannedFields(filled);
      if (result.micronutrients?.length) {
        setSelectedMicros(prev => {
          const updated = [...prev];
          for (const { key, amount } of result.micronutrients!) {
            if (!isValidMicroKey(key)) continue;
            const existing = updated.find(m => m.key === key);
            if (existing) { existing.amount = String(amount); }
            else { updated.push({ key: key as MicronutrientKey, amount: String(amount) }); }
          }
          return updated;
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBookScanning(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      let finalImageUrl: string | undefined = imageUrl ?? undefined;
      if (!finalImageUrl && imageFile) {
        finalImageUrl = await uploadFoodImage(imageFile);
      }

      await createFood({
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
  function fieldClass(field: string) {
    return scannedFields.has(field)
      ? 'border border-[#8fc63e] rounded-xl px-3 h-11 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-[#f0f8e0]'
      : inputClass;
  }
  const labelClass = 'text-xs font-medium text-gray-500 mb-1';

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center py-10 px-6 gap-6">

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Aliment salvat!</h2>
            <p className="text-gray-500 text-sm text-center">Alimentul a fost adăugat cu succes în baza de date.</p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => {
                setSuccess(false);
                setForm(emptyForm);
                setDietFlags(emptyFlags);
                setSelectedMicros([]);
                setImagePreview(null);
                setImageFile(null);
                setImageUrl(null);
                setStep(1);
              }}
            >
              Adaugă alt aliment
            </Button>
            <button onClick={() => router.push('/home')} className="text-sm text-gray-400 hover:text-gray-600">
              Înapoi la pagina principală
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
            <button onClick={() => router.push('/home')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
              <ArrowLeft className="w-4 h-4" /> Înapoi
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8fc63e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-[#8fc63e]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adaugă aliment</h1>
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
                className={nameExists ? `${inputClass} border-red-400 focus:border-red-400` : fieldClass('name')}
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
                  if (imageInputRef.current) imageInputRef.current.value = '';
                  const fn = file.name.toLowerCase();
                  const ct = file.type.toLowerCase();
                  const isHeic = fn.endsWith('.heic') || fn.endsWith('.heif') || ct.includes('heic') || ct.includes('heif');
                  if (isHeic) {
                    setImageUploading(true);
                    setImagePreview(null); setImageFile(null); setImageUrl(null);
                    try {
                      const url = await uploadFoodImage(file);
                      setImagePreview(url); setImageUrl(url);
                    } catch { setError('Eroare la încărcarea imaginii.'); }
                    finally { setImageUploading(false); }
                  } else {
                    setImagePreview(URL.createObjectURL(file));
                    setImageFile(file); setImageUrl(null);
                  }
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (cameraInputRef.current) cameraInputRef.current.value = '';
                  setImagePreview(URL.createObjectURL(file));
                  setImageFile(file); setImageUrl(null);
                }}
              />
              {imageUploading ? (
                <div className="w-full h-20 border-2 border-dashed border-[#8fc63e] rounded-xl flex flex-col items-center justify-center gap-2 text-[#8fc63e]">
                  <div className="w-6 h-6 border-2 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Se procesează imaginea...</span>
                </div>
              ) : imagePreview ? (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); setImageUrl(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex-1 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs font-medium">Galerie</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#8fc63e] hover:text-[#8fc63e] transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-medium">Cameră</span>
                  </button>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Scan label */}
            <input ref={scanInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { handleScanLabel(f); if (scanInputRef.current) scanInputRef.current.value = ''; } }} />
            <input ref={scanCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { handleScanLabel(f); if (scanCameraInputRef.current) scanCameraInputRef.current.value = ''; } }} />

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Scanează etichetă nutrițională</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => scanInputRef.current?.click()} disabled={scanning}
                  className="flex-1 h-12 border border-[#8fc63e] rounded-xl flex items-center justify-center gap-2 text-[#8fc63e] text-sm font-medium hover:bg-[#8fc63e]/10 transition-colors disabled:opacity-50">
                  {scanning ? <div className="w-4 h-4 border-2 border-[#8fc63e] border-t-transparent rounded-full animate-spin" /> : <ScanLine className="w-4 h-4" />}
                  {scanning ? 'Se scanează...' : 'Din galerie'}
                </button>
                <button type="button" onClick={() => scanCameraInputRef.current?.click()} disabled={scanning}
                  className="flex-1 h-12 border border-[#8fc63e] rounded-xl flex items-center justify-center gap-2 text-[#8fc63e] text-sm font-medium hover:bg-[#8fc63e]/10 transition-colors disabled:opacity-50">
                  <Camera className="w-4 h-4" />
                  Fotografiază eticheta
                </button>
              </div>
                {scannedFields.size > 0 && (
                <p className="text-xs text-[#8fc63e]">✓ {scannedFields.size} câmpuri completate automat. Verifică și corectează dacă e necesar.</p>
              )}
            </div>

            {/* Scan from book */}
            <input ref={bookScanInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { handleScanBook(f); if (bookScanInputRef.current) bookScanInputRef.current.value = ''; } }} />
            <input ref={bookScanCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { handleScanBook(f); if (bookScanCameraInputRef.current) bookScanCameraInputRef.current.value = ''; } }} />

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Scanează din carte</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => bookScanInputRef.current?.click()} disabled={bookScanning}
                  className="flex-1 h-12 border border-[#8fc63e] rounded-xl flex items-center justify-center gap-2 text-[#8fc63e] text-sm font-medium hover:bg-[#8fc63e]/10 transition-colors disabled:opacity-50">
                  {bookScanning ? <div className="w-4 h-4 border-2 border-[#8fc63e] border-t-transparent rounded-full animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  {bookScanning ? 'Se scanează...' : 'Din galerie'}
                </button>
                <button type="button" onClick={() => bookScanCameraInputRef.current?.click()} disabled={bookScanning}
                  className="flex-1 h-12 border border-[#8fc63e] rounded-xl flex items-center justify-center gap-2 text-[#8fc63e] text-sm font-medium hover:bg-[#8fc63e]/10 transition-colors disabled:opacity-50">
                  <Camera className="w-4 h-4" />
                  Fotografiază pagina
                </button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Macros */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Macronutrienți principali *</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className={labelClass}>Calorii (kcal) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.kcal} onChange={e => set('kcal', e.target.value)} className={fieldClass('kcal')} />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Proteine (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.protein} onChange={e => set('protein', e.target.value)} className={fieldClass('protein')} />
              </div>
            </div>

            {/* Carbohidrati + zaharuri */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label className={labelClass}>Carbohidrați (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.carbohydrates} onChange={e => set('carbohydrates', e.target.value)} className={fieldClass('carbohydrates')} />
              </div>
              <div className="ml-4 pl-4 border-l-2 border-gray-100 flex flex-col">
                <label className={labelClass}>din care zaharuri (g)</label>
                <input type="number" min="0" step="0.1" value={form.sugars} onChange={e => set('sugars', e.target.value)} className={fieldClass('sugars')} />
              </div>
            </div>

            {/* Grasimi + subcategorii */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label className={labelClass}>Grăsimi (g) <span className="text-red-400">*</span></label>
                <input type="number" min="0" step="0.1" value={form.fat} onChange={e => set('fat', e.target.value)} className={fieldClass('fat')} />
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
                    <input type="number" min="0" step="0.1" value={form[field]} onChange={e => set(field, e.target.value)} className={fieldClass(field)} />
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Altele */}
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
                    className={fieldClass(field)}
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

            {/* Diet flags */}
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

            {/* Micronutrienti */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Micronutrienți</p>

            {/* Dropdown selector */}
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

            {/* Selected micronutrients */}
            {selectedMicros.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedMicros.map(({ key, amount }) => {
                  const label = MICRONUTRIENTS.find(m => m.key === key)?.label ?? key;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1 flex flex-col">
                        <label className={labelClass}>{label}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={amount}
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
              {loading ? 'Se salvează...' : 'Salvează alimentul'}
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
