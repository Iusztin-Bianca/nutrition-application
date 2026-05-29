'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf, User, Save, Clock, CheckCircle, XCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProfile, updateProfile } from '@/services/profileService';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentar' },
  { value: 'slightly_active', label: 'Ușor activ' },
  { value: 'moderate', label: 'Moderat activ' },
  { value: 'highly_active', label: 'Foarte activ' },
  { value: 'extremely_active', label: 'Extrem de activ' },
] as const;

type ActivityLevel = (typeof ACTIVITY_OPTIONS)[number]['value'];

interface FormState {
  first_name: string;
  last_name: string;
  weight: string;
  height: string;
  age: string;
  sex: 'F' | 'M' | '';
  waist: string;
  hip: string;
  activity_level: ActivityLevel | '';
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  const emptyForm: FormState = {
    first_name: '',
    last_name: '',
    weight: '',
    height: '',
    age: '',
    sex: '',
    waist: '',
    hip: '',
    activity_level: '',
  };

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    getProfile().then(profile => {
      if (profile) {
        setForm({
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          weight: profile.weight != null ? String(profile.weight) : '',
          height: profile.height != null ? String(profile.height) : '',
          age: profile.age != null ? String(profile.age) : '',
          sex: profile.sex ?? '',
          waist: profile.waist != null ? String(profile.waist) : '',
          hip: profile.hip != null ? String(profile.hip) : '',
          activity_level: profile.activity_level ?? '',
        });
      }
    }).finally(() => setLoadingProfile(false));
  }, [isEditMode]);

  const allFieldsFilled =
    form.first_name.trim() !== '' &&
    form.last_name.trim() !== '' &&
    form.weight !== '' &&
    form.height !== '' &&
    form.age !== '' &&
    form.sex !== '' &&
    form.waist !== '' &&
    form.hip !== '' &&
    form.activity_level !== '';

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const payload: Record<string, string | number> = {};
      if (form.first_name) payload.first_name = form.first_name;
      if (form.last_name) payload.last_name = form.last_name;
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.height) payload.height = parseFloat(form.height);
      if (form.age) payload.age = parseInt(form.age);
      if (form.sex) payload.sex = form.sex;
      if (form.waist) payload.waist = parseInt(form.waist);
      if (form.hip) payload.hip = parseInt(form.hip);
      if (form.activity_level) payload.activity_level = form.activity_level;

      await updateProfile(payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'border border-gray-200 rounded-xl px-3 h-11 w-full text-sm outline-none focus:border-[#8fc63e] transition-colors bg-white';

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#f5f0e5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8fc63e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center py-10 px-6 gap-6">

      {/* Modal succes */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Profil salvat!</h2>
            <p className="text-gray-500 text-sm text-center">
              Datele tale au fost salvate cu succes. Indicii tăi nutriționali au fost calculați.
            </p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push('/home')}
            >
              Mergi la pagina principală
            </Button>
          </div>
        </div>
      )}

      {/* Modal eroare */}
      {error && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Eroare</h2>
            <p className="text-gray-500 text-sm text-center">{error}</p>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-11"
              onClick={() => setError('')}
            >
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

      {/* Card formular */}
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-lg flex flex-col gap-5">

        {isEditMode && (
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Înapoi
          </button>
        )}

        {/* Header card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#8fc63e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#8fc63e]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Completează-ți profilul</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Aceste date ne ajută să îți calculăm indicii nutriționali personalizați
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Prenume */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Prenume</label>
          <input
            type="text"
            placeholder=""
            value={form.first_name}
            onChange={e => set('first_name', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Nume */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Nume</label>
          <input
            type="text"
            placeholder=""
            value={form.last_name}
            onChange={e => set('last_name', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Greutate */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Greutate (kg)</label>
          <input
            type="number"
            placeholder=""
            value={form.weight}
            onChange={e => set('weight', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Înălțime */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Înălțime (cm)</label>
          <input
            type="number"
            placeholder=""
            value={form.height}
            onChange={e => set('height', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Vârstă */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Vârstă</label>
          <input
            type="number"
            placeholder=""
            value={form.age}
            onChange={e => set('age', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Sex</label>
          <div className="grid grid-cols-2 gap-3">
            {(['F', 'M'] as const).map(s => (
              <button
                key={s}
                onClick={() => set('sex', s)}
                className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                  form.sex === s
                    ? 'bg-[#8fc63e] border-[#8fc63e] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#8fc63e] bg-white'
                }`}
              >
                {s === 'F' ? 'Feminin' : 'Masculin'}
              </button>
            ))}
          </div>
        </div>

        {/* Talie */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Talie (cm)</label>
          <input
            type="number"
            placeholder=""
            value={form.waist}
            onChange={e => set('waist', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Sold */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Sold (cm)</label>
          <input
            type="number"
            placeholder=""
            value={form.hip}
            onChange={e => set('hip', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Nivel activitate */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Nivel de activitate</label>
          <div className="relative">
            <select
              value={form.activity_level}
              onChange={e => set('activity_level', e.target.value)}
              className={`${inputClass} appearance-none pr-9 text-gray-600`}
            >
              <option value="" disabled>Selectează nivelul de activitate</option>
              {ACTIVITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Butoane */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={loading || !allFieldsFilled}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Se salvează...' : 'Salvează profilul'}
          </Button>
          {!isEditMode && (
            <button
              onClick={() => router.push('/home')}
              className="w-full flex items-center justify-center gap-2 h-11 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Completează mai târziu
            </button>
          )}
        </div>

      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        🌿 Mănâncă inteligent, trăiești echilibrat — Nutrition Tracker te ghidează zi de zi.
      </p>

    </div>
  );
}
