"""python -m scripts.catalog: insere a coleção Impulso sem sobrescrever produtos."""
import json
from pathlib import Path
from urllib.parse import unquote

from pymongo import ASCENDING, MongoClient
from pymongo.errors import PyMongoError

from app.config import Settings
from app.main import STATIC, document, utc_now
from app.models import ProductInput

CATALOG = Path(__file__).with_name('catalog.json')


def load_catalog():
    entries = json.loads(CATALOG.read_text(encoding='utf-8'))
    products = []
    for entry in entries:
        product = ProductInput.model_validate({k: v for k, v in entry.items() if k != 'catalogKey'})
        image = STATIC / 'assets' / unquote(str(product.imagemUrl).rsplit('/', 1)[-1])
        if not image.is_file():
            raise ValueError(f'Imagem ausente: {image.name}')
        products.append((entry['catalogKey'], product))
    if len({key for key, _ in products}) != len(products):
        raise ValueError('Identificadores de catálogo duplicados.')
    return products


def seed_catalog(collection):
    products = load_catalog()  # Valida toda a coleção antes de escrever.
    collection.create_index([('catalogKey', ASCENDING)], unique=True, sparse=True)
    inserted = 0
    for key, product in products:
        doc = document(product)
        doc['criadoEm'] = doc['atualizadoEm'] = utc_now()
        result = collection.update_one({'catalogKey': key}, {'$setOnInsert': doc}, upsert=True)
        inserted += result.upserted_id is not None
    return inserted


if __name__ == '__main__':
    try:
        settings = Settings()
        with MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=7000) as client:
            print(f'{seed_catalog(client[settings.mongodb_database].produtos)} produto(s) inserido(s).')
    except PyMongoError:
        raise SystemExit('Não foi possível cadastrar: conexão com MongoDB indisponível.') from None
