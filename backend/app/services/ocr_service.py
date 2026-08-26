import json
import re
from io import BytesIO
from PIL import Image

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

_LABEL_PROMPT = """
Extract nutritional values from this food label or nutrition table image.
Return ONLY a valid JSON object with these fields (null if not found):
{
  "kcal": number or null,
  "protein": number or null,
  "carbohydrates": number or null,
  "sugars": number or null,
  "fat": number or null,
  "saturated_fat": number or null,
  "fiber": number or null,
  "salt": number or null,
  "sodium": number or null
}
Values must be per 100g. Use decimal point (not comma) for decimals. Output nothing outside the JSON.
"""

_BOOK_PROMPT = """
Analyze this Romanian nutrition science book page.

The title follows "Compoziția chimică a [food in genitive case]".
Convert the food name to Romanian nominative case (e.g., "mărului"→"Măr", "caiselor"→"Caise", "roșiei"→"Roșie", "pâinii"→"Pâine").

Return ONLY this valid JSON (null if value is "lipsă" or not found; omit micronutrients with "lipsă"):
{
  "name": "food name capitalized in nominative",
  "kcal": number or null,
  "protein": number or null,
  "carbohydrates": number or null,
  "fat": number or null,
  "fiber": number or null,
  "water": number or null,
  "sodium": number or null,
  "micronutrients": [{"key": "...", "amount": number}]
}

Micronutrient key mappings (only include if present and not "lipsă"):
fier→"iron", calciu→"calcium", potasiu→"potassium", zinc→"zinc",
magneziu→"magnesium", cupru→"copper", mangan→"manganese", fosfor→"phosphorus",
seleniu→"selenium", iod→"iodine",
tiamină/vit.B1→"vitamin_b1", riboflavină/vit.B2→"vitamin_b2", niacina/vit.B3/PP→"vitamin_b3",
vitamina C→"vitamin_c", vitamina B6→"vitamin_b6", biotină/vit.B7→"vitamin_b7",
acid folic/vit.B9→"vitamin_b9", vitamina B12→"vitamin_b12",
retinol eq/vitamina A→"vitamin_a", vitamina E→"vitamin_e",
vitamina D→"vitamin_d", vitamina K→"vitamin_k",
colesterol→"cholesterol", alcool→"alcohol"

Main field mappings: proteine totale→protein, lipide totale→fat,
glucide disponibile→carbohydrates, fibre alimentare→fiber, apă→water,
sodiu→sodium (not in micronutrients), energie→kcal.

All values per 100g. Convert ALL micronutrient amounts to mg:
- μg → mg: divide by 1000 (e.g., 1 μg = 0.001 mg)
- g → mg: multiply by 1000 (e.g., 1 g = 1000 mg)
Output nothing outside the JSON.
"""


def _run_gemini(image_bytes: bytes, prompt: str) -> dict:
    from ..core.config import settings

    if not GENAI_AVAILABLE:
        raise RuntimeError("google-generativeai nu este instalat.")
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY nu este configurat.")

    genai.configure(api_key=settings.gemini_api_key)
    image = Image.open(BytesIO(image_bytes))
    model = genai.GenerativeModel("gemini-3.5-flash-lite")

    try:
        response = model.generate_content([prompt, image])
    except Exception as e:
        raise RuntimeError(f"Eroare Gemini: {e}")

    raw = response.text.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'\s*```\s*$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            raise ValueError("Răspuns invalid de la Gemini.")
        data = json.loads(match.group())

    data["raw_text"] = raw
    return data


def scan_label(image_bytes: bytes) -> dict:
    return _run_gemini(image_bytes, _LABEL_PROMPT)


def scan_book_page(image_bytes: bytes) -> dict:
    return _run_gemini(image_bytes, _BOOK_PROMPT)
