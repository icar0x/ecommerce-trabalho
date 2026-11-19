import {api, ready, element, productCard, loadRecent, showState, favoriteIds} from './shop.js';

const params = new URLSearchParams(location.search);
let category = params.get('categoria') || '';
let page = Math.max(1, Math.min(100000, Number.parseInt(params.get('pagina'), 10) || 1));
let search = (params.get('busca') || '').slice(0, 160);
let controller;
let requestNumber = 0;
let favoritesOnly = params.get('favoritos') === '1';
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
  const currentRequest = ++requestNumber;
  const query = new URLSearchParams({busca: search, categoria: category, pagina: page, limite: 12});
  if (favoritesOnly) query.set('favoritos', '1');
  history.replaceState(null, '', `/?${query}${location.hash}`);
  grid.setAttribute('aria-busy', 'true');
  grid.replaceChildren(); status.hidden = false; status.textContent = 'Buscando seus próximos favoritos…';
  document.querySelector('#pagination').hidden = true;
  document.querySelector('#clear-filters').hidden = !search && !category && !favoritesOnly;
  document.querySelector('#catalog-title').textContent = favoritesOnly ? 'Seus favoritos' : 'Escolhas para o seu próximo passo';
  updateCategoryButtons();
  try {
    let data;
    if (favoritesOnly) {
      const response = await api('/api/carrinho/consultar', {method: 'POST', signal: controller.signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({produtoIds: favoriteIds()})});
      const products = response.dados.filter(product => (!category || product.categoria === category) && product.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
      data = {dados: products.slice((page - 1) * 12, page * 12), total: products.length, limite: 12};
    } else data = await api(`/api/produtos?${query}`, {signal: controller.signal});
    if (currentRequest !== requestNumber) return;
    if (page > 1 && !data.dados.length && data.total > 0) { page = 1; return load(); }
    document.querySelector('#result-count').textContent = `${data.total} produto${data.total === 1 ? '' : 's'} encontrado${data.total === 1 ? '' : 's'}`;
    if (!data.dados.length) {
      showState(status, favoritesOnly ? 'Seus próximos favoritos estão por aí.' : search || category ? 'Nenhum produto por aqui.' : 'O próximo movimento está chegando.',
        favoritesOnly ? 'Toque no coração de um produto para guardá-lo aqui.' : search || category ? 'Tente outro nome ou explore todas as categorias.' : 'Estamos preparando nosso catálogo. Volte em breve para conferir as novidades.',
        search || category || favoritesOnly ? {text: 'Ver todos os produtos', run: clear} : null);
    } else {
      status.hidden = true; grid.replaceChildren(...data.dados.map(productCard));
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

function clear() { category = ''; search = ''; favoritesOnly = false; page = 1; searchInput.value = ''; load(); }
document.querySelector('#clear-filters').onclick = clear;
document.querySelector('#view-all-products').onclick = event => { event.preventDefault(); clear(); };
window.addEventListener('favoriteschange', () => { if (favoritesOnly) load(); });
document.querySelector('#visual-categories').onclick = event => {
  const link = event.target.closest('[data-category]');
  if (!link) return;
  event.preventDefault(); category = link.dataset.category; favoritesOnly = false; search = ''; searchInput.value = ''; page = 1; load(); document.querySelector('#catalogo').scrollIntoView();
};
document.querySelector('#category-tabs').onclick = event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category; search = searchInput.value.trim(); page = 1; load();
};
document.querySelector('#catalog-filters').onsubmit = event => { event.preventDefault(); search = searchInput.value.trim(); page = 1; load(); };
searchInput.addEventListener('search', () => { search = searchInput.value.trim(); page = 1; load(); });
for (const [id, step] of [['previous-page', -1], ['next-page', 1]]) {
  document.getElementById(id).onclick = () => { page += step; load(); document.querySelector('#catalogo').scrollIntoView(); };
}
await ready;
await loadCategories();
await Promise.allSettled([load(), loadRecent()]);
