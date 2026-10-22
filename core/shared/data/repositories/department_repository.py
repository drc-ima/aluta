from typing import Any

from sqlalchemy import insert

from shared.data.models import Department
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import DepartmentDomain
from sqlalchemy.orm import Session


class DepartmentRepository(BaseRepository[Department, DepartmentDomain]):
    model = Department
    