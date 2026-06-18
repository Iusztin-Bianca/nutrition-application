'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMeasurements, Measurement } from '@/services/measurementService';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
}

export default function MonitorizarePage() {
  const router = useRouter();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMeasurements()
      .then(setMeasurements)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const weightData = measurements
    .filter((m) => m.weight !== null)
    .map((m) => ({ date: formatDate(m.recorded_at), value: m.weight }));

  const waistData = measurements
    .filter((m) => m.waist !== null)
    .map((m) => ({ date: formatDate(m.recorded_at), value: m.waist }));

  return (
    <div className="min-h-screen bg-[#f5f0e5]">
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </button>
      </header>

      <main className="px-6 pb-16 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Monitorizare</h1>
        <p className="text-gray-500 text-sm mb-8">Evoluția greutății și taliei în timp</p>

        {loading && <p className="text-gray-500">Se încarcă datele...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!loading && !error && (
          <>
            <ChartCard
              title="Greutate (kg)"
              data={weightData}
              color="#8fc63e"
              unit=" kg"
              empty={weightData.length === 0}
            />
            <ChartCard
              title="Talie (cm)"
              data={waistData}
              color="#f59e0b"
              unit=" cm"
              empty={waistData.length === 0}
            />
          </>
        )}
      </main>
    </div>
  );
}

function ChartCard({
  title,
  data,
  color,
  unit,
  empty,
}: {
  title: string;
  data: { date: string; value: number | null }[];
  color: string;
  unit: string;
  empty: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
      {empty ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nu există date înregistrate încă.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              domain={[
                (dataMin: number) => Math.floor(dataMin - Math.max(1, (dataMin * 0.02))),
                (dataMax: number) => Math.ceil(dataMax + Math.max(1, (dataMax * 0.02))),
              ]}
            />
            <Tooltip
              formatter={(value) => [`${value}${unit}`, title]}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
