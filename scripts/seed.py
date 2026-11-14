"""Execute com python -m scripts.seed. Nunca apaga ou sobrescreve produtos."""
from datetime import datetime, timezone

from pymongo import ASCENDING, MongoClient

from app.config import Settings
from app.main import document
from app.models import ProductInput

SAMPLES = [
    ('camiseta', 'Camiseta de treino', 'Roupas', '79.90', 15),
    ('bola', 'Bola de futebol', 'Equipamentos', '129.90', 8),
    ('tenis', 'Tênis de corrida', 'Calçados', '299.90', 12),
    ('garrafa', 'Garrafa esportiva 750 ml', 'Acessórios', '39.90', 30),
]


def seed(collection):
    collection.create_index([('demoKey', ASCENDING)], unique=True, sparse=True)
    inserted = 0
    for key, name, category, price, stock in SAMPLES:
        doc = document(ProductInput(nome=name, descricao='Produto de demonstração.', categoria=category, preco=price, estoque=stock))
        doc['criadoEm'] = doc['atualizadoEm'] = datetime.now(timezone.utc)
        result = collection.update_one({'demoKey': key}, {'$setOnInsert': doc}, upsert=True)
        inserted += result.upserted_id is not None
    return inserted


if __name__ == '__main__':
    settings = Settings()
    with MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000) as client:
        print(f'{seed(client[settings.mongodb_database].produtos)} produto(s) inserido(s).')
