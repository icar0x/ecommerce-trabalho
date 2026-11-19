"""QA opcional: python -m scripts.check_frontend (servidor local já iniciado).

Requer `python -m pip install playwright` e Edge instalado no Windows.
Cria dois produtos temporários e apaga somente esses produtos e o histórico
do navegador de teste. Não usa o perfil nem o carrinho pessoal do usuário.
"""
from pathlib import Path
from uuid import uuid4

from bson import Decimal128
from playwright.sync_api import expect, sync_playwright
from pymongo import MongoClient
from redis import Redis

from app.config import Settings
from app.main import document, utc_now
from app.models import ProductInput


def check():
    settings = Settings()
    output = Path('.artifacts')
    output.mkdir(exist_ok=True)
    marker = f'QA-{uuid4().hex[:8]}'
    name = f'Treino {marker}'
    sold_name = f'Esgotado {marker}'
    ids = []
    visitors = set()
    errors = []
    with MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=7000) as mongo, Redis.from_url(settings.redis_url, socket_timeout=5) as cache:
        collection = mongo[settings.mongodb_database].produtos
        try:
            for product_name, stock in [(name, 3), (sold_name, 0)]:
                doc = document(ProductInput(nome=product_name, descricao='Produto temporário de verificação.', preco='79.90', categoria='Roupas', estoque=stock))
                doc['criadoEm'] = doc['atualizadoEm'] = utc_now()
                ids.append(collection.insert_one(doc).inserted_id)

            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(channel='msedge', headless=True)
                context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto('http://127.0.0.1:8000/')
                page.locator('#search').fill(marker)
                page.locator('#search').press('Enter')
                expect(page.locator('#product-grid .product-card')).to_have_count(2)
                expect(page.locator('#visual-categories .category-card')).to_have_count(3)
                expect(page.locator('#category-tabs .chip')).to_have_count(4)
                assert page.locator('#visual-categories .category-card').evaluate_all('(cards) => cards.map(card => card.dataset.category)') == ['Roupas', 'Tênis', 'Acessórios']
                expect(page.get_by_role('button', name=f'Adicionar {sold_name} ao carrinho')).to_be_disabled()
                visitors.update(cookie['value'] for cookie in context.cookies() if cookie['name'] == 'visitante')
                page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
                page.screenshot(path=str(output / 'loja-desktop.png'), full_page=True)
                print('OK: vitrine, busca e produto esgotado.', flush=True)

                page.locator('.chip[data-category="Roupas"]').click()
                expect(page.locator('#product-grid')).to_contain_text(name)
                favorite = page.get_by_role('button', name=f'Salvar {name} nos favoritos', exact=True)
                favorite.click()
                expect(favorite).to_have_attribute('aria-pressed', 'true')
                page.get_by_role('link', name='Meus favoritos', exact=True).first.click()
                expect(page.locator('#catalog-title')).to_have_text('Seus favoritos')
                expect(page.locator('#product-grid .product-card')).to_have_count(1)
                page.reload()
                expect(page.locator('#product-grid .product-card')).to_have_count(1)
                page.get_by_role('button', name=f'Salvar {name} nos favoritos', exact=True).click()
                expect(page.locator('#product-grid .product-card')).to_have_count(0)
                page.goto(f'http://127.0.0.1:8000/?busca={marker}')
                expect(page.locator('#product-grid .product-card')).to_have_count(2)
                print('OK: filtro por categoria, favoritos, persistência e remoção de favoritos.', flush=True)

                with page.expect_response(lambda response: response.url.endswith('/api/recentes') and response.request.method == 'POST'):
                    page.get_by_role('link', name=name, exact=True).click()
                expect(page.locator('#product-name')).to_have_text(name)
                expect(page.locator('#product-price')).to_have_text('R$ 79,90')
                # Aguarda a gravação real no histórico.
                page.wait_for_function("document.querySelector('#product-detail').hidden === false")
                page.set_viewport_size({'width': 390, 'height': 844})
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.screenshot(path=str(output / 'produto-mobile.png'), full_page=True)
                page.set_viewport_size({'width': 1440, 'height': 1000})
                page.locator('#quantity').fill('2')
                page.get_by_role('button', name='Adicionar ao carrinho', exact=True).click()
                expect(page.locator('#cart-count')).to_have_text('2')
                page.goto('http://127.0.0.1:8000/carrinho')
                expect(page.locator('#cart-total')).to_have_text('R$ 159,80')
                page.reload()
                expect(page.locator('#cart-total')).to_have_text('R$ 159,80')
                page.set_viewport_size({'width': 390, 'height': 844})
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.screenshot(path=str(output / 'carrinho-mobile.png'), full_page=True)
                page.set_viewport_size({'width': 1440, 'height': 1000})
                page.get_by_role('button', name=f'Aumentar quantidade de {name}').click()
                expect(page.locator('#cart-total')).to_have_text('R$ 239,70')
                print('OK: detalhes, adição, quantidade, subtotal e persistência do carrinho.', flush=True)

                history = page.request.get('http://127.0.0.1:8000/api/recentes').json()['dados']
                assert history and history[0]['id'] == str(ids[0])
                visitors.update(cookie['value'] for cookie in context.cookies() if cookie['name'] == 'visitante')
                other = browser.new_context()
                response = other.request.get('http://127.0.0.1:8000/api/recentes')
                assert response.json()['dados'] == []
                visitors.update(cookie['value'] for cookie in other.cookies() if cookie['name'] == 'visitante')
                other.close()
                page.goto('http://127.0.0.1:8000/')
                expect(page.locator('#recent-section')).to_be_visible()
                expect(page.locator('#recent-grid')).to_contain_text(name)
                print('OK: histórico real, exibição de recentes e isolamento de visitantes.', flush=True)

                collection.update_one({'_id': ids[0]}, {'$set': {'estoque': 1, 'preco': Decimal128('89.90')}})
                page.goto('http://127.0.0.1:8000/carrinho')
                expect(page.locator('#cart-total')).to_have_text('R$ 269,70')
                expect(page.locator('.cart-item-warning')).to_contain_text('apenas 1')
                page.get_by_role('button', name=f'Diminuir quantidade de {name}').click()
                expect(page.locator('#cart-total')).to_have_text('R$ 89,90')
                collection.delete_one({'_id': ids[0]})
                page.reload()
                expect(page.locator('.cart-item-warning')).to_contain_text('Indisponível')
                expect(page.locator('#cart-total')).to_have_text('R$ 0,00')
                page.get_by_role('button', name='Remover produto do carrinho', exact=True).click()
                expect(page.locator('#cart-status')).to_contain_text('Seu carrinho está esperando movimento.')
                print('OK: preço e estoque atuais, produto removido e carrinho vazio.', flush=True)

                page.evaluate("localStorage.setItem('impulso_cart_v1', '{quebrado')")
                page.reload()
                expect(page.locator('#cart-status')).to_contain_text('Seu carrinho está esperando movimento.')
                page.goto(f'http://127.0.0.1:8000/?busca={marker}')
                page.set_viewport_size({'width': 390, 'height': 844})
                expect(page.locator('#product-grid .product-card')).to_have_count(1)
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
                page.screenshot(path=str(output / 'loja-mobile.png'), full_page=True)
                assert not errors, 'Erros JavaScript encontrados no navegador.'
                browser.close()
                print('OK: armazenamento inválido, layout mobile sem rolagem lateral e JavaScript sem exceções.', flush=True)
        finally:
            if ids:
                collection.delete_many({'_id': {'$in': ids}})
            for visitor in visitors:
                cache.delete(f'recentes:{visitor}')
            print('Limpeza: somente produtos e históricos temporários removidos.', flush=True)


if __name__ == '__main__':
    try:
        check()
    except Exception as exc:
        print(f'QA FALHOU: {type(exc).__name__}. Consulte os passos acima; credenciais não são exibidas.')
        raise SystemExit(1) from None
