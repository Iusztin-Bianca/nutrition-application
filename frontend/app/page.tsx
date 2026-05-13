'use client';

import { useEffect, useState } from 'react';

type HealthStatus = {
  status: string;
  db: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nu s-a putut conecta la server');
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🥗</div>
          <h1 className="text-3xl font-bold text-gray-800">NutriTrack</h1>
          <p className="text-gray-500 mt-1">Nutritia ta, simplificata</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Status sistem
          </h2>

          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-sm">Se conecteaza...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {health && !error && (
            <div className="space-y-3">
              <StatusRow label="API" value={health.status} ok={health.status === 'ok'} />
              <StatusRow label="Baza de date" value={health.db} ok={health.db === 'connected'} />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">NutriTrack v0.1.0</p>
      </div>
    </main>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className={`text-sm font-medium ${ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
