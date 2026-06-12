'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { register } from '@/services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email) return 'E-mailul este obligatoriu!';
  if (!EMAIL_REGEX.test(email)) return 'E-mailul nu este în formatul corect!';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Parola este obligatorie!';
  if (password.length < 6) return 'Parola trebuie să aibă minim 6 caractere!';
  if (password.length > 72) return 'Parola nu poate depăși 72 de caractere!';
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    const emailError = validateEmail(email);
    if (emailError) { setErrorModal(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setErrorModal(passwordError); return; }

    if (!gdprAccepted) {
      setErrorModal('Trebuie să accepți politica de confidențialitate.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, gdprAccepted);
      setSuccess(true);
    } catch (err: any) {
      setErrorModal(err.message);
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
            <p className="text-gray-500 text-sm text-center">
              Ți-am trimis un email de confirmare la <strong>{email}</strong>.<br />
              Verifică inbox-ul și apasă link-ul pentru a activa contul.
            </p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push('/login')}
            >
              Mergi la logare
            </Button>
          </div>
        </div>
      )}

      {/* Modal eroare */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Date invalide</h2>
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

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div
            onClick={() => setGdprAccepted(prev => !prev)}
            className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
              gdprAccepted ? 'bg-[#8fc63e] border-[#8fc63e]' : 'border-gray-300 bg-white'
            }`}
          >
            {gdprAccepted && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600" onClick={() => setGdprAccepted(prev => !prev)}>
            Am citit și accept{' '}
            <a
              href="https://www.termsfeed.com/live/your-privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[#8fc63e] underline"
            >
              Politica de Confidențialitate
            </a>
            {' '}și prelucrarea datelor personale.
          </span>
        </label>

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
