from ..data.repositories.user_details_repository import UserDetailsRepository
from ..data.repositories.user_measurement_repository import UserMeasurementRepository
from ..data.schemas.user_details import UserDetailsUpdate
from ..core.enums import ACTIVITY_FACTORS

class UserDetailsService:
    def __init__(self, repo: UserDetailsRepository, measurement_repo: UserMeasurementRepository | None = None):
        self.repo = repo
        self.measurement_repo = measurement_repo

    def _calculate(self, details) -> dict:
        updates = {}

        # Compute IMC("Indice Masa Corporala")
        # IMC = weight/ (height(m)^2)
        if details.weight and details.height:
            height_m = details.height / 100
            updates["imc"] = round(details.weight / (height_m**2),2)

        # Compute BMR ("Rata Metabolica Bazala")
        # M: BMR = 10*weight(kg) + 6.25*height(cm) - 5*age + 5
        # F: BMR = 10*weight(kg) + 6.25*height(cm) - 5*age - 161
        if details.weight and details.height and details.age and details.sex:
            if details.sex == "M":
               updates["bmr"] = round((10 * details.weight) + (6.25 * details.height) - (5 * details.age) +5, 2)
            else:
               updates["bmr"] = round((10 * details.weight) + (6.25 * details.height) - (5 * details.age) -161, 2)

        bmr = updates.get("bmr") or details.bmr 

        # Compute MZT ("Metabolic zilnic total")
        # MZT = BMR * nivel_activitate
        if bmr and details.activity_level:
            factor = ACTIVITY_FACTORS.get(details.activity_level.name, 1.2)
            updates["mzt"] = round(bmr * factor, 2)

        # Compute TS (Talie/Sold)
        if details.waist and details.hip:
            updates["ts"] = round(details.waist / details.hip, 2)

        return updates
    
    
    async def get_or_create(self, user_id: int):
        details = await self.repo.get_user_by_id(user_id)
        if not details:
            details = await self.repo.add_user(user_id)
        return details

    
    async def update_user_details(self, user_id: int, data: UserDetailsUpdate):
        details = await self.repo.get_user_by_id(user_id)
        if not details:
            details = await self.repo.add_user(user_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key,value in update_dict.items():
            setattr(details, key, value)

        calculated = self._calculate(details)
        update_dict.update(calculated)

        result = await self.repo.update(details, update_dict)

        if self.measurement_repo and (data.weight is not None or data.waist is not None):
            await self.measurement_repo.add(user_id, details.weight, details.waist)

        return result
