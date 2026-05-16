'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { register, login } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      await login(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/home'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center justify-between py-10 px-6">

      {/* Modal succes */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cont creat cu succes!</h2>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#8fc63e] h-1.5 rounded-full animate-[progress_2s_linear]" />
            </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Creează un cont nou</h1>
          <p className="text-gray-500 text-sm mt-1">Doar câteva detalii și ești gata!</p>
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
              placeholder="Minim 6 caractere"
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
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-12"
          onClick={handleRegister}
          disabled={loading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {loading ? 'Se creează contul...' : 'Creează cont'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Ai deja cont?{' '}
          <span
            className="text-[#8fc63e] font-medium cursor-pointer"
            onClick={() => router.push('/login')}
          >
            Loghează-te
          </span>
        </p>

      </div>

      <p className="text-xs text-gray-400 text-center">
        🌿 Mănâncă inteligent, trăiești echilibrat — Nutrition Tracker te ghidează zi de zi.
      </p>

    </div>
  );
}
