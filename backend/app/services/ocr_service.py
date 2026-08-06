import re
import sys
from io import BytesIO
from PIL import Image, ImageFilter, ImageEnhance

try:
    import pytesseract
    if sys.platform == "win32":
        import os
        custom = os.environ.get("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
        pytesseract.pytesseract.tesseract_cmd = custom
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


def _preprocess(image: Image.Image) -> Image.Image:
    image = image.convert("L")
    w, h = image.size
    if max(w, h) < 1000:
        scale = 1500 / max(w, h)
        image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    image = ImageEnhance.Contrast(image).enhance(2.0)
    image = image.filter(ImageFilter.SHARPEN)
    return image


def _parse(text: str) -> dict:
    text = text.lower()
    text = text.replace(",", ".").replace("–", "-")

    def find(patterns: list[str]) -> float | None:
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                try:
                    return float(m.group(1))
                except (ValueError, IndexError):
                    pass
        return None

    kcal = find([
        r'(\d+\.?\d*)\s*kcal',
        r'energie[^\d]*(\d+\.?\d*)',
        r'energy[^\d]*(\d+\.?\d*)',
    ])
    protein = find([
        r'protein[eă]?\s*[:\|]?\s*(\d+\.?\d*)',
        r'proteine\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    carbohydrates = find([
        r'carbohidra[țt]i\s*[:\|]?\s*(\d+\.?\d*)',
        r'glucide\s*[:\|]?\s*(\d+\.?\d*)',
        r'carbohydrates?\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    sugars = find([
        r'(?:din care\s+)?zaharuri\s*[:\|]?\s*(\d+\.?\d*)',
        r'(?:of which\s+)?sugars?\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    fat = find([
        r'gr[ăa]simi\s*[:\|]?\s*(\d+\.?\d*)',
        r'lipide\s*[:\|]?\s*(\d+\.?\d*)',
        r'(?<!\w)fat\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    saturated_fat = find([
        r'(?:din care\s+)?acizi gra[șs]i satura[țt]i\s*[:\|]?\s*(\d+\.?\d*)',
        r'satura[țt]i\s*[:\|]?\s*(\d+\.?\d*)',
        r'saturated\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    fiber = find([
        r'fibr[eă]\s*[:\|]?\s*(\d+\.?\d*)',
        r'fibre?\s*[:\|]?\s*(\d+\.?\d*)',
        r'dietary fiber\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    salt = find([
        r'(?<!\w)sare\s*[:\|]?\s*(\d+\.?\d*)',
        r'(?<!\w)salt\s*[:\|]?\s*(\d+\.?\d*)',
    ])
    sodium = find([
        r'sodiu\s*[:\|]?\s*(\d+\.?\d*)',
        r'sodium\s*[:\|]?\s*(\d+\.?\d*)',
    ])

    return {
        "kcal": kcal,
        "protein": protein,
        "carbohydrates": carbohydrates,
        "sugars": sugars,
        "fat": fat,
        "saturated_fat": saturated_fat,
        "fiber": fiber,
        "salt": salt,
        "sodium": sodium,
    }


def scan_label(image_bytes: bytes) -> dict:
    if not TESSERACT_AVAILABLE:
        raise RuntimeError("pytesseract nu este instalat.")

    image = Image.open(BytesIO(image_bytes))
    processed = _preprocess(image)

    try:
        text = pytesseract.image_to_string(processed, lang="ron+eng", config="--psm 6")
    except pytesseract.TesseractError:
        text = pytesseract.image_to_string(processed, lang="eng", config="--psm 6")

    result = _parse(text)
    result["raw_text"] = text
    return result
