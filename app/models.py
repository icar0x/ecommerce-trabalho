from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal, get_args

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator

ProductCategory = Literal['Roupas', 'Tênis', 'Acessórios']
CATEGORIES = get_args(ProductCategory)


class ProductInput(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    nome: str = Field(min_length=1, max_length=160)
    descricao: str = Field(default='', max_length=5000)
    preco: Decimal = Field(gt=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    categoria: ProductCategory
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


class CartQuery(BaseModel):
    model_config = ConfigDict(extra='forbid')
    produtoIds: list[Annotated[str, Field(pattern=r'^[a-fA-F0-9]{24}$')]] = Field(max_length=50)
