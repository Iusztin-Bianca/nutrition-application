const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Measurement {
  id: number;
  recorded_at: string;
  weight: number | null;
  waist: number | null;
}

export async function getMeasurements(): Promise<Measurement[]> {
  const token = document.cookie
    .split('; ')
    .find((c) => c.startsWith('token='))
    ?.split('=')[1];

  const res = await fetch(`${API_URL}/api/profile/measurements`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Nu s-au putut încărca măsurătorile.');
  return res.json();
}
