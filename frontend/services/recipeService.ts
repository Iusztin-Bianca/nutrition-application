const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RecipeIngredientIn {
  food_id: number;
  quantity_grams: number;
}

export interface RecipeCreate {
  name: string;
  description?: string;
  image_url?: string;
  ingredients: RecipeIngredientIn[];
}

export interface RecipeIngredientDetail {
  food_id: number;
  food_name: string;
  quantity_grams: number;
  food_kcal: number;
  food_protein: number;
  food_carbohydrates: number;
  food_fat: number;
}

export async function createRecipe(data: RecipeCreate): Promise<{ id: number }> {
  const res = await fetch(`${API_URL}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la salvarea rețetei.');
  return json;
}

export async function getRecipeIngredients(recipeId: number): Promise<RecipeIngredientDetail[]> {
  const res = await fetch(`${API_URL}/api/recipes/${recipeId}/ingredients`);
  const json = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error('Eroare la încărcarea ingredientelor.');
  return json as RecipeIngredientDetail[];
}

export async function updateRecipe(recipeId: number, data: RecipeCreate): Promise<{ id: number }> {
  const res = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || 'Eroare la actualizarea rețetei.');
  return json;
}
