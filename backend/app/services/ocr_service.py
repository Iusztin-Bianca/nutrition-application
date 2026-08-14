import json
import re
from io import BytesIO
from PIL import Image
from ..core.config import settings

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

_PROMPT = """
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


def scan_label(image_bytes: bytes) -> dict:

    if not GENAI_AVAILABLE:
        raise RuntimeError("google-generativeai nu este instalat.")
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY nu este configurat.")

    genai.configure(api_key=settings.gemini_api_key)

    image = Image.open(BytesIO(image_bytes))
    model = genai.GenerativeModel("gemini-3.5-flash-lite")

    try:
        response = model.generate_content([_PROMPT, image])
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
