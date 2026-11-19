import re
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

import httpx
from bson import Decimal128, ObjectId
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient, ReturnDocument
from pymongo.errors import PyMongoError
from redis import Redis
from redis.exceptions import RedisError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.auth import SupabaseAuth
from app.config import Settings
from app.models import CATEGORIES, CartQuery, Login, Product, ProductInput, RecentInput

STATIC = Path(__file__).parent / 'static'
TTL = 7 * 24 * 60 * 60
bearer = HTTPBearer(auto_error=False)


def object_id(value):
    if not ObjectId.is_valid(value):
        raise HTTPException(400, 'ID de produto inválido.')
    return ObjectId(value)


def serialize(doc):
    fields = {key: value for key, value in doc.items() if key in Product.model_fields}
    return Product(**{**fields, 'id': str(doc['_id']), 'preco': doc['preco'].to_decimal()})


def utc_now():
    # BSON datetime tem precisão de milissegundos.
    now = datetime.now(timezone.utc)
    return now.replace(microsecond=(now.microsecond // 1000) * 1000)


def document(product):
    data = product.model_dump(mode='python')
    data['preco'] = Decimal128(product.preco.quantize(Decimal('0.01')))
    data['imagemUrl'] = str(product.imagemUrl) if product.imagemUrl else None
    return data


def create_app(settings=None, products=None, redis=None, auth=None):
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        mongo = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000, tz_aware=True) if products is None else None
        cache = Redis.from_url(settings.redis_url, decode_responses=True, socket_timeout=3, socket_connect_timeout=3) if redis is None else redis
        client = httpx.Client(timeout=10)
        app.state.products = mongo[settings.mongodb_database].produtos if mongo is not None else products
        app.state.redis = cache
        app.state.auth = auth or SupabaseAuth(settings, client)
        try:
            yield
        finally:
            client.close()
            if mongo is not None:
                mongo.close()
            if redis is None:
                cache.close()

    app = FastAPI(title='E-commerce esportivo', lifespan=lifespan)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request, exc):
        return JSONResponse({'erro': {'mensagem': exc.detail}}, status_code=exc.status_code, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        # Não devolver o input: pode conter a senha informada no login.
        errors = [{'campo': '.'.join(map(str, e['loc'])), 'mensagem': e['msg']} for e in exc.errors()]
        return JSONResponse({'erro': {'mensagem': 'Dados inválidos.', 'campos': errors}}, status_code=422)

    async def database_error(request, exc):
        return JSONResponse({'erro': {'mensagem': 'Banco de dados indisponível.'}}, status_code=503)

    app.add_exception_handler(PyMongoError, database_error)
    app.add_exception_handler(RedisError, database_error)

    @app.middleware('http')
    async def headers(request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: http:; frame-ancestors 'none'; form-action 'self'" if not request.url.path.startswith('/docs') else "frame-ancestors 'none'"
        if request.url.path.startswith('/api') or request.url.path.startswith('/admin'):
            response.headers['Cache-Control'] = 'no-store'
        return response

    def admin(request: Request, credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
        if credentials is None:
            raise HTTPException(401, 'Token Bearer obrigatório.', headers={'WWW-Authenticate': 'Bearer'})
        return request.app.state.auth.admin(credentials.credentials)

    def visitor(request, response):
        value = request.cookies.get('visitante')
        try:
            value = str(UUID(value))
        except (ValueError, TypeError, AttributeError):
            value = str(uuid4())
        response.set_cookie('visitante', value, max_age=TTL, httponly=True, secure=settings.cookie_secure, samesite='lax', path='/')
        return f'recentes:{value}'

    def find(request, value):
        doc = request.app.state.products.find_one({'_id': object_id(value)})
        if doc is None:
            raise HTTPException(404, 'Produto não encontrado.')
        return doc

    @app.post('/api/auth/login')
    def login(body: Login, request: Request):
        return {'dados': request.app.state.auth.login(str(body.email), body.password)}

    @app.get('/api/loja')
    def store_info():
        return {'dados': {'nome': settings.loja_nome}}

    @app.get('/api/categorias')
    def categories():
        return {'dados': list(CATEGORIES)}

    @app.post('/api/carrinho/consultar')
    def cart_products(body: CartQuery, request: Request):
        ids = [ObjectId(value) for value in body.produtoIds]
        docs = request.app.state.products.find({'_id': {'$in': ids}})
        return {'dados': [serialize(doc) for doc in docs]}

    @app.get('/api/auth/me')
    def me(user=Depends(admin)):
        return {'dados': {'id': user['id'], 'email': user.get('email')}}

    @app.post('/api/auth/logout', status_code=204)
    def logout(request: Request, user=Depends(admin), credentials=Depends(bearer)):
        request.app.state.auth.logout(credentials.credentials)
        return Response(status_code=204)

    @app.get('/api/produtos')
    def list_products(request: Request, busca: str = Query('', max_length=160), categoria: str = Query('', max_length=100), limite: int = Query(100, ge=1, le=100), pagina: int = Query(1, ge=1)):
        query = {}
        if busca.strip():
            query['nome'] = {'$regex': re.escape(busca.strip()), '$options': 'i'}
        if categoria:
            query['categoria'] = categoria
        collection = request.app.state.products
        docs = collection.find(query).sort([('criadoEm', -1), ('_id', -1)]).skip((pagina - 1) * limite).limit(limite)
        return {'dados': [serialize(doc) for doc in docs], 'total': collection.count_documents(query), 'pagina': pagina, 'limite': limite}

    @app.get('/api/produtos/{id}')
    def get_product(id: str, request: Request):
        return {'dados': serialize(find(request, id))}

    @app.post('/api/produtos', status_code=201)
    def create_product(body: ProductInput, request: Request, user=Depends(admin)):
        doc = document(body)
        doc['criadoEm'] = doc['atualizadoEm'] = utc_now()
        doc['_id'] = request.app.state.products.insert_one(doc).inserted_id
        return {'dados': serialize(doc)}

    @app.put('/api/produtos/{id}')
    def update_product(id: str, body: ProductInput, request: Request, user=Depends(admin)):
        data = document(body)
        data['atualizadoEm'] = utc_now()
        doc = request.app.state.products.find_one_and_update({'_id': object_id(id)}, {'$set': data}, return_document=ReturnDocument.AFTER)
        if doc is None:
            raise HTTPException(404, 'Produto não encontrado.')
        return {'dados': serialize(doc)}

    @app.delete('/api/produtos/{id}', status_code=204)
    def delete_product(id: str, request: Request, user=Depends(admin)):
        if not request.app.state.products.delete_one({'_id': object_id(id)}).deleted_count:
            raise HTTPException(404, 'Produto não encontrado.')
        return Response(status_code=204)

    @app.post('/api/recentes')
    def record_recent(body: RecentInput, request: Request, response: Response):
        product_id = str(find(request, body.produtoId)['_id'])
        key = visitor(request, response)
        with request.app.state.redis.pipeline(transaction=True) as pipe:
            pipe.lrem(key, 0, product_id)
            pipe.lpush(key, product_id)
            pipe.ltrim(key, 0, 9)
            pipe.expire(key, TTL)
            pipe.execute()
        return {'dados': {'produtoId': product_id}}

    @app.get('/api/recentes')
    def recent(request: Request, response: Response):
        ids = request.app.state.redis.lrange(visitor(request, response), 0, 9)
        valid = [ObjectId(value) for value in ids if ObjectId.is_valid(value)]
        docs = {str(doc['_id']): doc for doc in request.app.state.products.find({'_id': {'$in': valid}})}
        return {'dados': [serialize(docs[value]) for value in ids if value in docs]}

    @app.get('/', include_in_schema=False)
    def index():
        return FileResponse(STATIC / 'index.html')

    @app.get('/loja', include_in_schema=False)
    def catalog_page():
        return FileResponse(STATIC / 'collection.html')

    @app.get('/admin/login', include_in_schema=False)
    def login_page():
        return FileResponse(STATIC / 'login.html')

    @app.get('/produtos/{id}', include_in_schema=False)
    def product_page(id: str):
        object_id(id)
        return FileResponse(STATIC / 'product.html')

    @app.get('/carrinho', include_in_schema=False)
    def cart_page():
        return FileResponse(STATIC / 'cart.html')

    @app.get('/admin', include_in_schema=False)
    def admin_page():
        return FileResponse(STATIC / 'admin.html')

    app.mount('/static', StaticFiles(directory=STATIC), name='static')
    return app


app = create_app()
