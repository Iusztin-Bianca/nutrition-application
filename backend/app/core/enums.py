import enum


class GenderEnum(str, enum.Enum):
    F = "F"
    M = "M"


class ActivityLevelEnum(str, enum.Enum):
    sedentary = "sedentary"
    slightly_active = "slightly_active"
    moderate = "moderate"
    highly_active = "highly_active"
    extremely_active = "extremely_active"


ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "slightly_active": 1.375,
    "moderate": 1.55,
    "highly_active": 1.725,
    "extremely_active": 1.9,
}
