const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface FoodCreate {
  name: string;
  description?: string;
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
  micronutrients: [];
}

export async function createFood(data: FoodCreate): Promise<{ id: number }> {
  const res = await fetch(`${API_URL}/api/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Eroare la salvarea alimentului.');
  return json;
}
