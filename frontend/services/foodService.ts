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
}

export async function checkFoodName(name: string): Promise<boolean> {
  if (!name.trim()) return false;
  const res = await fetch(`${API_URL}/api/foods/check-name?name=${encodeURIComponent(name.trim())}`);
  if (!res.ok) return false;
  const json = await res.json();
  return json.exists as boolean;
}

export async function getFoods(skip = 0, limit = 50): Promise<FoodItem[]> {
  const res = await fetch(`${API_URL}/api/foods?skip=${skip}&limit=${limit}`);
  const json = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error('Eroare la încărcarea alimentelor.');
  return json as FoodItem[];
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
