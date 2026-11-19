import {api, ready, element, productCard, loadRecent, showState, favoriteIds} from './shop.js?v=20261119-header3';
import {initHero} from './hero.js';
import {groupProducts} from './product-variants.mjs';

initHero(document.querySelector('.hero-carousel'));

const params = new URLSearchParams(location.search);
const isCollection = document.body.dataset.page === 'collection';
const pageSize = 12;
let category = params.get('categoria') || '';
let page = Math.max(1, Math.min(100000, Number.parseInt(params.get('pagina'), 10) || 1));
let search = (params.get('busca') || '').slice(0, 160);
let controller;
let requestNumber = 0;
let favoritesOnly = params.get('favoritos') === '1' || (!isCollection && !category && !search && params.get('catalogo') !== '1');
const searchInput = document.querySelector('#search');
const grid = document.querySelector('#product-grid');
const status = document.querySelector('#catalog-status');
searchInput.value = search;

function updateCategoryButtons() {
  for (const button of document.querySelectorAll('[data-category]')) {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active);
    if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(active));
    else if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
}

async function loadCategories() {
  try {
    const {dados} = await api('/api/categorias');
    const categories = dados;
    if (category === 'Calçados') category = 'Tênis';
    if (category && !categories.includes(category)) category = '';
    const tabs = document.querySelector('#category-tabs');
    for (const value of categories) {
      const button = element('button', 'chip', value); button.type = 'button';
      button.dataset.category = value; tabs.append(button);
    }
    updateCategoryButtons();
  } catch { /* Busca por nome e todos os produtos continuam disponíveis. */ }
}

async function load() {
  controller?.abort(); controller = new AbortController();
  const signal = controller.signal;
  const currentRequest = ++requestNumber;
  const query = new URLSearchParams({busca: search, categoria: category, pagina: page, limite: pageSize});
  if (favoritesOnly) query.set('favoritos', '1');
  else query.set('catalogo', '1');
  history.replaceState(null, '', `${isCollection ? '/loja' : '/'}?${query}${location.hash}`);
  grid.setAttribute('aria-busy', 'true');
  grid.replaceChildren(); status.hidden = false; status.textContent = 'Buscando seus próximos favoritos…';
  document.querySelector('#pagination').hidden = true;
  document.querySelector('#clear-filters').hidden = !search && !category;
  document.querySelector('#catalog-filters').hidden = favoritesOnly;
  document.querySelector('#catalog-title').textContent = favoritesOnly ? 'Seus favoritos' : category || 'Escolhas para o seu próximo passo';
  updateCategoryButtons();
  try {
    let data;
    let products;
    if (favoritesOnly) {
      const response = await api('/api/carrinho/consultar', {method: 'POST', signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({produtoIds: favoriteIds()})});
      products = response.dados.filter(product => (!category || product.categoria === category) && product.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    } else {
      // Agrupar antes de paginar impede que cores do mesmo modelo fiquem em páginas diferentes.
      const fetchQuery = new URLSearchParams({busca: search, categoria: category, pagina: 1, limite: 100});
      const response = await api(`/api/produtos?${fetchQuery}`, {signal});
      products = response.dados;
      for (let next = 2; products.length < response.total; next++) {
        fetchQuery.set('pagina', next);
        const more = await api(`/api/produtos?${fetchQuery}`, {signal});
        if (!more.dados.length) break;
        products.push(...more.dados);
      }
    }
    const groups = groupProducts(products);
    data = {dados: groups.slice((page - 1) * pageSize, page * pageSize), total: groups.length, limite: pageSize};
    if (currentRequest !== requestNumber) return;
    if (page > 1 && !data.dados.length && data.total > 0) { page = 1; return load(); }
    document.querySelector('#result-count').textContent = `${data.total} produto${data.total === 1 ? '' : 's'} encontrado${data.total === 1 ? '' : 's'}`;
    if (!data.dados.length) {
      showState(status, favoritesOnly ? 'Seus próximos favoritos estão por aí.' : search || category ? 'Nenhum produto por aqui.' : 'O próximo movimento está chegando.',
        favoritesOnly ? 'Toque no coração de um produto para guardá-lo aqui.' : search || category ? 'Tente outro nome ou explore todas as categorias.' : 'Estamos preparando nosso catálogo. Volte em breve para conferir as novidades.',
        search || category || favoritesOnly ? {text: 'Ver todos os produtos', run: showAll} : null);
    } else {
      status.hidden = true; grid.replaceChildren(...data.dados.map(group => productCard(group.product, group.variants)));
    }
    const pages = Math.ceil(data.total / data.limite);
    document.querySelector('#pagination').hidden = pages <= 1;
    document.querySelector('#page-label').textContent = `Página ${page} de ${pages}`;
    document.querySelector('#previous-page').disabled = page <= 1;
    document.querySelector('#next-page').disabled = page >= pages;
  } catch (error) {
    if (error.name === 'AbortError' || currentRequest !== requestNumber) return;
    document.querySelector('#result-count').textContent = 'Não foi possível carregar os produtos.';
    showState(status, 'Vamos tentar de novo?', error.message, {text: 'Tentar novamente', run: load});
  } finally { if (currentRequest === requestNumber) grid.setAttribute('aria-busy', 'false'); }
}

function clear() { category = ''; search = ''; page = 1; searchInput.value = ''; load(); }
function showAll() {
  if (isCollection) { location.assign('/?catalogo=1#catalogo'); return; }
  favoritesOnly = false; clear();
}
document.querySelector('#clear-filters').onclick = clear;
document.querySelector('#view-all-products').onclick = event => { event.preventDefault(); showAll(); };
window.addEventListener('favoriteschange', () => { if (favoritesOnly) load(); });
document.querySelector('#category-tabs').onclick = event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  if (!isCollection && button.dataset.category) {
    location.assign(`/loja?${new URLSearchParams({categoria: button.dataset.category})}#catalogo`);
    return;
  }
  favoritesOnly = false; category = button.dataset.category; search = searchInput.value.trim(); page = 1; load();
};
document.querySelector('#catalog-filters').onsubmit = event => { event.preventDefault(); favoritesOnly = false; search = searchInput.value.trim(); page = 1; load(); };
window.addEventListener('catalogsearch', () => { favoritesOnly = false; page = 1; load(); });
searchInput.addEventListener('search', () => { search = searchInput.value.trim(); page = 1; load(); });
for (const [id, step] of [['previous-page', -1], ['next-page', 1]]) {
  document.getElementById(id).onclick = () => { page += step; load(); document.querySelector('#catalogo').scrollIntoView(); };
}
await ready;
await loadCategories();
await Promise.allSettled([load(), loadRecent()]);
// Voltar pelo navegador pode restaurar o HTML antigo sem executar os módulos outra vez.
window.addEventListener('pageshow', event => { if (event.persisted) { loadRecent(); if (favoritesOnly) load(); } });
