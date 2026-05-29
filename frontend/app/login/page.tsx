'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/services/authService';
import { getProfile } from '@/services/profileService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login(email, password);
      let profile = null;
      try {
        profile = await getProfile();
      } catch {
        // profile fetch failed — treat as no profile
      }
      if (!profile || !profile.first_name) {
        router.push('/complete-profile');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setErrorModal(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center justify-between py-10 px-6">

      {/* Modal eroare */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Eroare</h2>
            <p className="text-gray-500 text-sm text-center">{errorModal}</p>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-11"
              onClick={() => setErrorModal('')}
            >
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

      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">

        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Înapoi
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logare în cont</h1>
          <p className="text-gray-500 text-sm mt-1">
            Introdu emailul și parola pentru a continua.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="nume@exemplu.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Parolă</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            />
            <button onClick={() => setShowPassword(!showPassword)}>
              {showPassword
                ? <EyeOff className="w-4 h-4 text-gray-400" />
                : <Eye className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <span
            className="text-xs text-[#8fc63e] self-end cursor-pointer hover:underline"
            onClick={() => router.push('/forgot-password')}
          >
            Ai uitat parola?
          </span>
        </div>

        <Button
          className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12"
          onClick={handleLogin}
          disabled={loading}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loading ? 'Se conectează...' : 'Conectează-te'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Nu ai cont?{' '}
          <span
            className="text-[#8fc63e] font-medium cursor-pointer"
            onClick={() => router.push('/register')}
          >
            Creează unul acum
          </span>
        </p>

      </div>

      <p className="text-xs text-gray-400 text-center">
        🌿 Mănâncă inteligent, trăiești echilibrat — Nutrition Tracker te ghidează zi de zi.
      </p>

    </div>
  );
}
