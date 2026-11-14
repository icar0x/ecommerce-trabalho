from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator


class ProductInput(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    nome: str = Field(min_length=1, max_length=160)
    descricao: str = Field(default='', max_length=5000)
    preco: Decimal = Field(gt=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    categoria: str = Field(default='', max_length=100)
    imagemUrl: HttpUrl | None = None
    estoque: Annotated[int, Field(strict=True, ge=0, le=2147483647)]

    @field_validator('imagemUrl', mode='before')
    @classmethod
    def empty_image(cls, value):
        return None if value == '' else value


class Product(ProductInput):
    id: str
    criadoEm: datetime
    atualizadoEm: datetime


class Login(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=1024)


class RecentInput(BaseModel):
    produtoId: str
