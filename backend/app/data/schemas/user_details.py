from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from ...core.enums import GenderEnum, ActivityLevelEnum

class UserDetailsUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[GenderEnum] = None
    waist: Optional[int] = None
    hip: Optional[int] = None
    activity_level: Optional[ActivityLevelEnum] = None

class UserDetailsResponse(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[GenderEnum] = None
    waist: Optional[int] = None
    hip: Optional[int] = None
    activity_level: Optional[ActivityLevelEnum] = None
    imc: Optional[float] = None
    bmr: Optional[float] = None
    mzt: Optional[float] = None
    ts: Optional[float] = None

    model_config = {"from_attributes": True}


class MeasurementResponse(BaseModel):
    id: int
    recorded_at: datetime
    weight: Optional[float] = None
    waist: Optional[int] = None

    model_config = {"from_attributes": True}
