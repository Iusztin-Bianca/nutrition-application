const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserDetailsUpdate {
  first_name?: string;
  last_name?: string;
  weight?: number;
  height?: number;
  age?: number;
  sex?: 'F' | 'M';
  waist?: number;
  hip?: number;
  activity_level?: 'sedentary' | 'slightly_active' | 'moderate' | 'highly_active' | 'extremely_active';
}

export interface UserDetailsResponse extends UserDetailsUpdate {
  id: number;
  imc?: number;
  bmr?: number;
  mzt?: number;
  ts?: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getProfile(): Promise<UserDetailsResponse | null> {
  const res = await fetch(`${API_URL}/api/profile`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Eroare la încărcarea profilului.');
  return data;
}

export async function updateProfile(payload: UserDetailsUpdate): Promise<UserDetailsResponse> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Eroare la salvarea profilului.');
  return data;
}
