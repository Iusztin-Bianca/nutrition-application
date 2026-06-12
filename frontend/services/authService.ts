const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  gdpr_accepted: boolean;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export async function register(email: string, password: string, gdprAccepted: boolean): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, gdpr_accepted: gdprAccepted }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.detail)
      ? data.detail.map((e: any) => e.msg).join(', ')
      : data.detail || "Eroare la înregistrare.";
    throw new Error(msg);
  }
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.detail)
      ? data.detail.map((e: any) => e.msg).join(', ')
      : data.detail || "Eroare la autentificare.";
    throw new Error(msg);
  }

  localStorage.setItem("token", data.access_token);
  document.cookie = `token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Eroare.");
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Eroare.");
}

export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Eroare.");
}

export async function deleteAccount(): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/profile/account`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Eroare la ștergerea contului.");
  }
}

export function logout(): void {
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function acceptGdpr(): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/auth/accept-gdpr`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Eroare la acceptarea GDPR.");
  }
}
