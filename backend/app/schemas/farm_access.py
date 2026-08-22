import uuid
from pydantic import BaseModel


class GrantFarmAccess(BaseModel):
    user_id: uuid.UUID
    farm_id: uuid.UUID
