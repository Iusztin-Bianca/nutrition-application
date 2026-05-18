'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/services/authService';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link invalid.');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => { setStatus('error'); setMessage(err.message); });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f5f0e5] flex flex-col items-center justify-center gap-8 px-6">

      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 bg-[#8fc63e] rounded-2xl flex items-center justify-center shadow">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-gray-900">Nutrition </span>
          <span className="text-[#8fc63e]">Tracker</span>
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#8fc63e] animate-spin" />
            <p className="text-gray-500 text-sm">Se verifică emailul...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[#8fc63e]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#8fc63e]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Email confirmat!</h2>
            <p className="text-gray-500 text-sm text-center">
              Contul tău a fost activat. Te poți loga acum.
            </p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push('/login')}
            >
              Mergi la logare
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Link invalid</h2>
            <p className="text-gray-500 text-sm text-center">
              {message || 'Link-ul este invalid sau a expirat.'}
            </p>
            <Button
              className="w-full bg-[#8fc63e] hover:bg-[#7ab332] text-white rounded-2xl h-11"
              onClick={() => router.push('/register')}
            >
              Înregistrează-te din nou
            </Button>
          </>
        )}
      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
