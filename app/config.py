from uuid import UUID

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env', env_file_encoding='utf-8', extra='ignore')
    mongodb_uri: str = 'mongodb://localhost:27017'
    mongodb_database: str = 'ecommerce_esportivo'
    redis_url: str = 'redis://localhost:6379/0'
    supabase_url: str = ''
    supabase_key: str = ''
    admin_user_ids: str = ''
    cookie_secure: bool = False
    loja_nome: str = 'Impulso'

    @field_validator('admin_user_ids')
    @classmethod
    def validate_admins(cls, value):
        return ','.join(str(UUID(item.strip())) for item in value.split(',') if item.strip())

    @property
    def admins(self):
        return set(self.admin_user_ids.split(',')) - {''}
