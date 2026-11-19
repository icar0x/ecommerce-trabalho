from uuid import uuid4

import fakeredis
import httpx
import mongomock
import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import ConnectionFailure
from redis.exceptions import ConnectionError as RedisConnectionError

from app.auth import SupabaseAuth
from app.config import Settings
from app.main import TTL, create_app
from scripts.seed import seed

ADMIN = str(uuid4())
OTHER = str(uuid4())
HEADERS = {'Authorization': 'Bearer valid'}
PRODUCT = {'nome': 'Camiseta', 'descricao': 'Treino', 'preco': '79.90', 'categoria': 'Roupas', 'estoque': 15}


@pytest.fixture
def setup():
    collection = mongomock.MongoClient(tz_aware=True).db.produtos
    cache = fakeredis.FakeRedis(decode_responses=True)
    settings = Settings(_env_file=None, supabase_url='https://test.supabase.co', supabase_key='fake', admin_user_ids=ADMIN)
    calls = []

    def supabase(request):
        calls.append(request)
        if request.url.path.endswith('/token'):
            if b'wrong' in request.content:
                return httpx.Response(400, json={'error': 'invalid_grant'})
            token = 'other' if b'other@example.com' in request.content else 'valid'
            return httpx.Response(200, json={'access_token': token, 'expires_in': 3600})
        if request.url.path.endswith('/logout'):
            return httpx.Response(204)
        token = request.headers.get('authorization')
        if token == 'Bearer valid':
            return httpx.Response(200, json={'id': ADMIN, 'email': 'admin@example.com'})
        if token == 'Bearer other':
            return httpx.Response(200, json={'id': OTHER})
        return httpx.Response(401, json={'message': 'invalid'})

    with httpx.Client(transport=httpx.MockTransport(supabase)) as remote:
        app = create_app(settings, collection, cache, SupabaseAuth(settings, remote))
        with TestClient(app) as client:
            yield client, collection, cache, calls


def create(client, **overrides):
    response = client.post('/api/produtos', json={**PRODUCT, **overrides}, headers=HEADERS)
    assert response.status_code == 201, response.text
    return response.json()['dados']


def test_auth(setup):
    client, _, _, calls = setup
    assert client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'correct'}).json()['dados']['access_token'] == 'valid'
    assert client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'wrong'}).status_code == 401
    assert client.post('/api/auth/login', json={'email': 'other@example.com', 'password': 'correct'}).status_code == 403
    for headers, status in [({}, 401), ({'Authorization': 'Bearer invalid'}, 401), ({'Authorization': 'Bearer other'}, 403)]:
        for method, path in [('post', '/api/produtos'), ('put', f'/api/produtos/{ObjectId()}'), ('delete', f'/api/produtos/{ObjectId()}')]:
            assert client.request(method, path, json=PRODUCT, headers=headers).status_code == status
    assert client.post('/api/auth/logout', headers=HEADERS).status_code == 204
    assert calls[-1].url.path.endswith('/logout')


def test_crud_and_search(setup):
    client, collection, _, _ = setup
    product = create(client)
    pid = product['id']
    assert product['preco'] == '79.90'
    assert product['criadoEm'].endswith('Z')
    assert str(collection.find_one() ['preco']) == '79.90'
    assert client.get(f'/api/produtos/{pid}').json()['dados'] == product
    assert client.get('/api/produtos?busca=CAMI&categoria=Roupas').json()['total'] == 1
    assert client.get('/api/produtos?busca=.*').json()['total'] == 0
    assert client.get('/api/produtos?categoria=T%C3%AAnis').json()['total'] == 0
    updated = client.put(f'/api/produtos/{pid}', json={**PRODUCT, 'preco': '0.10', 'estoque': 0}, headers=HEADERS).json()['dados']
    assert updated['preco'] == '0.10'
    assert updated['criadoEm'] == product['criadoEm']
    assert client.delete(f'/api/produtos/{pid}', headers=HEADERS).status_code == 204
    for method in ['get', 'put', 'delete']:
        assert client.request(method, f'/api/produtos/{pid}', json=PRODUCT, headers=HEADERS).status_code == 404
        assert client.request(method, '/api/produtos/invalid', json=PRODUCT, headers=HEADERS).status_code == 400


@pytest.mark.parametrize('field,value', [('nome', ''), ('nome', '   '), ('preco', '0'), ('preco', '-1'), ('preco', '1.001'), ('preco', 'NaN'), ('preco', 'Infinity'), ('estoque', -1), ('estoque', 1.2), ('estoque', True), ('imagemUrl', 'javascript:alert(1)'), ('imagemUrl', 'invalid'), ('categoria', ''), ('categoria', 'Equipamentos'), ('categoria', 'Outra')])
def test_validation(setup, field, value):
    client = setup[0]
    assert client.post('/api/produtos', json={**PRODUCT, field: value}, headers=HEADERS).status_code == 422


def test_recent_history(setup):
    client, collection, cache, _ = setup
    products = [create(client, nome=f'Produto {n}') for n in range(12)]
    ids = [p['id'] for p in products]
    for pid in ids:
        assert client.post('/api/recentes', json={'produtoId': pid}).status_code == 200
    cookie = client.cookies.get('visitante')
    key = f'recentes:{cookie}'
    assert cache.lrange(key, 0, -1) == ids[::-1][:10]
    assert TTL - 2 <= cache.ttl(key) <= TTL
    cache.expire(key, 20)
    client.post('/api/recentes', json={'produtoId': ids[-2]})
    assert cache.llen(key) == 10
    assert cache.lindex(key, 0) == ids[-2]
    assert cache.ttl(key) > TTL - 2
    cache.expire(key, 20)
    client.get('/api/recentes')
    assert cache.ttl(key) <= 20  # GET não renova o TTL do Redis.
    client.put(f'/api/produtos/{ids[-2]}', json={**PRODUCT, 'nome': 'Atualizado'}, headers=HEADERS)
    assert client.get('/api/recentes').json()['dados'][0]['nome'] == 'Atualizado'
    collection.delete_one({'_id': ObjectId(ids[-2])})
    assert len(client.get('/api/recentes').json()['dados']) == 9
    assert client.post('/api/recentes', json={'produtoId': ids[-2]}).status_code == 404
    assert client.post('/api/recentes', json={'produtoId': 'bad'}).status_code == 400
    client.cookies.clear()
    assert client.get('/api/recentes').json()['dados'] == []
    assert client.cookies.get('visitante') != cookie
    client.get(f'/api/produtos/{ids[0]}')
    assert client.get('/api/recentes').json()['dados'] == []
    client.cookies.set('visitante', 'invalid')
    assert client.get('/api/recentes').status_code == 200
    assert client.cookies.get('visitante', domain='testserver.local') != 'invalid'
    cache.expire(key, 0)
    assert cache.lrange(key, 0, -1) == []


def test_seed_preserves_edits(setup):
    client, collection, _, _ = setup
    assert seed(collection) == 4
    collection.update_one({'demoKey': 'shorts'}, {'$set': {'nome': 'Nome editado'}})
    assert seed(collection) == 0
    assert collection.count_documents({}) == 4
    assert collection.find_one({'demoKey': 'shorts'})['nome'] == 'Nome editado'
    response = client.get('/api/produtos?limite=2&pagina=2').json()
    assert response['total'] == 4
    assert len(response['dados']) == 2
    assert 'demoKey' not in response['dados'][0]


def test_pages_and_no_password_echo(setup):
    client = setup[0]
    for path in ['/', '/carrinho', f'/produtos/{ObjectId()}', '/admin', '/admin/login', '/static/admin.js', '/static/shop.css', '/static/catalog.js', '/static/shop-core.mjs', '/docs', '/openapi.json']:
        assert client.get(path).status_code == 200
    response = client.post('/api/auth/login', json={'email': 'invalid', 'password': ''})
    assert response.status_code == 422
    assert 'input' not in response.text
    assert client.get('/api/produtos').headers['cache-control'] == 'no-store'


def test_service_unavailable(setup, monkeypatch):
    client, collection, cache, _ = setup

    def fail_mongo(*args, **kwargs):
        raise ConnectionFailure('secret URI must not leak')

    def fail_redis(*args, **kwargs):
        raise RedisConnectionError('secret URL must not leak')

    monkeypatch.setattr(collection, 'find', fail_mongo)
    response = client.get('/api/produtos')
    assert response.status_code == 503
    assert 'secret' not in response.text
    monkeypatch.setattr(cache, 'lrange', fail_redis)
    assert client.get('/api/recentes').status_code == 503


def test_supabase_network_and_missing_configuration():
    def fail(request):
        raise httpx.ConnectError('private details', request=request)

    from fastapi import HTTPException
    with httpx.Client(transport=httpx.MockTransport(fail)) as client:
        settings = Settings(_env_file=None, supabase_url='https://test.supabase.co', supabase_key='fake', admin_user_ids='')
        auth = SupabaseAuth(settings, client)
        with pytest.raises(HTTPException) as error:
            auth.admin('any')
        assert error.value.status_code == 503
        settings.supabase_key = ''
        with pytest.raises(HTTPException) as error:
            auth.login('admin@example.com', 'password')
        assert error.value.status_code == 503


def test_catalog_categories_and_cart_queries(setup):
    client, collection, _, _ = setup
    assert client.get('/api/loja').json()['dados']['nome'] == 'Impulso'
    assert client.get('/api/categorias').json()['dados'] == ['Roupas', 'Tênis', 'Acessórios']
    first = create(client)
    second = create(client, nome='Tênis casual', categoria='Tênis')
    create(client, nome='Boné', categoria='Acessórios')
    assert client.get('/api/categorias').json()['dados'] == ['Roupas', 'Tênis', 'Acessórios']
    assert client.get('/api/produtos?categoria=T%C3%AAnis').json()['total'] == 1
    response = client.post('/api/carrinho/consultar', json={'produtoIds': [first['id'], second['id'], str(ObjectId())]})
    assert response.status_code == 200
    assert {p['id'] for p in response.json()['dados']} == {first['id'], second['id']}
    assert response.json()['dados'][0]['preco'] == '79.90'
    collection.delete_one({'_id': ObjectId(first['id'])})
    assert client.post('/api/carrinho/consultar', json={'produtoIds': [first['id']]}).json()['dados'] == []
    assert client.post('/api/carrinho/consultar', json={'produtoIds': []}).json()['dados'] == []
    assert client.post('/api/carrinho/consultar', json={'produtoIds': ['bad']}).status_code == 422
    assert client.post('/api/carrinho/consultar', json={'produtoIds': [first['id']] * 51}).status_code == 422
