'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getCurrentMondayString(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function getUserStorageKey(): string {
  const token = localStorage.getItem('token');
  if (!token) return 'measurementReminderLastDismissed_anonymous';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub ?? payload.email ?? 'unknown';
    return `measurementReminderLastDismissed_${userId}`;
  } catch {
    return 'measurementReminderLastDismissed_unknown';
  }
}

export default function WeeklyMeasurementReminder() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = getUserStorageKey();
    const thisMonday = getCurrentMondayString();
    const lastDismissed = localStorage.getItem(key);
    if (lastDismissed !== thisMonday) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    const key = getUserStorageKey();
    localStorage.setItem(key, getCurrentMondayString());
    setVisible(false);
  }

  function handleUpdate() {
    dismiss();
    router.push('/complete-profile?mode=edit');
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
        <button
          onClick={dismiss}
          className="self-end text-gray-400 hover:text-gray-600 transition-colors -mt-2 -mr-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-[#f0f8e0] rounded-full flex items-center justify-center">
          <Scale className="w-8 h-8 text-[#8fc63e]" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center">
          Reminder săptămânal
        </h2>

        <p className="text-gray-500 text-sm text-center leading-relaxed">
          Nu ai actualizat încă <strong>greutatea</strong> și <strong>talia</strong> săptămâna aceasta.
          Urmărind evoluția săptămânală îți poți monitoriza progresul mai ușor.
        </p>

        <Button
          className="w-full bg-[#8fc63e] hover:bg-[#7db235] text-white rounded-2xl h-11"
          onClick={handleUpdate}
        >
          Actualizează acum
        </Button>

        <button
          onClick={dismiss}
          className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Modifică mai târziu
        </button>
      </div>
    </div>
  );
}
