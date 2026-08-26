const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadFoodImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/foods/upload-image`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la încărcarea imaginii.');
  return json.url as string;
}

export interface FoodCreate {
  name: string;
  description?: string;
  image_url?: string;
  kcal: number;
  protein: number;
  carbohydrates: number;
  sugars?: number;
  fat: number;
  saturated_fat?: number;
  polyunsat_fat?: number;
  monounsat_fat?: number;
  trans_fat?: number;
  fiber?: number;
  water?: number;
  salt?: number;
  sodium?: number;
  glycemic_index?: number;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_raw_vegan: boolean;
  is_mediterranean: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_fodmap: boolean;
  is_recipe: boolean;
  micronutrients: { nutrient: string; amount: number }[];
}

export interface FoodResponse extends FoodCreate {
  id: number;
}

export interface FoodItem {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  kcal: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_recipe: boolean;
}

export async function checkFoodName(name: string, excludeId?: number): Promise<boolean> {
  if (!name.trim()) return false;
  let url = `${API_URL}/api/foods/check-name?name=${encodeURIComponent(name.trim())}`;
  if (excludeId !== undefined) url += `&exclude_id=${excludeId}`;
  const res = await fetch(url);
  if (!res.ok) return false;
  const json = await res.json();
  return json.exists as boolean;
}

export async function updateFood(id: number, data: FoodCreate): Promise<FoodResponse> {
  const res = await fetch(`${API_URL}/api/foods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la actualizarea alimentului.');
  return json as FoodResponse;
}

export async function getFood(id: number): Promise<FoodResponse> {
  const res = await fetch(`${API_URL}/api/foods/${id}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Alimentul nu a fost găsit.');
  return json as FoodResponse;
}

export interface FoodFilters {
  search?: string;
  diets?: string[];
  is_recipe?: boolean | null;
}

function buildFoodParams(filters: FoodFilters, skip = 0, limit = 50) {
  const p: Record<string, string> = { skip: String(skip), limit: String(limit) };
  if (filters.search) p.search = filters.search;
  if (filters.diets?.length) p.diets = filters.diets.join(',');
  if (filters.is_recipe != null) p.is_recipe = String(filters.is_recipe);
  return new URLSearchParams(p);
}

export async function getFoodsCount(filters: FoodFilters = {}): Promise<number> {
  const p = buildFoodParams(filters);
  const res = await fetch(`${API_URL}/api/foods/count?${p}`);
  const json = await res.json().catch(() => ({ count: 0 }));
  return json.count as number;
}

export async function getFoods(skip = 0, limit = 50, filters: FoodFilters = {}): Promise<FoodItem[]> {
  const p = buildFoodParams(filters, skip, limit);
  const res = await fetch(`${API_URL}/api/foods?${p}`);
  const json = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error('Eroare la încărcarea alimentelor.');
  return json as FoodItem[];
}

export async function deleteFood(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/foods/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || 'Eroare la ștergerea alimentului.');
  }
}

export interface ScanLabelResult {
  kcal?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  sugars?: number | null;
  fat?: number | null;
  saturated_fat?: number | null;
  fiber?: number | null;
  salt?: number | null;
  sodium?: number | null;
  raw_text?: string;
}

export interface ScanBookResult {
  name?: string | null;
  kcal?: number | null;
  protein?: number | null;
  carbohydrates?: number | null;
  fat?: number | null;
  fiber?: number | null;
  water?: number | null;
  sodium?: number | null;
  micronutrients?: { key: string; amount: number }[];
  raw_text?: string;
}

export async function scanBookPage(file: File): Promise<ScanBookResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/foods/scan-book`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la scanarea paginii.');
  return json as ScanBookResult;
}

export async function scanFoodLabel(file: File): Promise<ScanLabelResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/foods/scan-label`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la scanarea etichetei.');
  return json as ScanLabelResult;
}

export async function createFood(data: FoodCreate): Promise<{ id: number }> {
  const res = await fetch(`${API_URL}/api/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la salvarea alimentului.');
  return json;
}
