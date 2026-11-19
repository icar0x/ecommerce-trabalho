import {api, element, productCard, loadRecent, showState, favoriteIds} from './shop.js?v=20261119-responsive1';
import {initHero} from './hero.js';
import {groupProducts} from './product-variants.mjs';
import {fetchAllProducts} from './products-api.mjs';

initHero(document.querySelector('.hero-carousel'));

const params = new URLSearchParams(location.search);
const isCollection = document.body.dataset.page === 'collection';
const pageSize = 12;
let category = params.get('categoria') || '';
let page = Math.max(1, Math.min(100000, Number.parseInt(params.get('pagina'), 10) || 1));
let search = (params.get('busca') || '').slice(0, 160);
let controller;
let requestNumber = 0;
let favoritesOnly = params.get('favoritos') === '1';
let homeShelves = !isCollection && !category && !search && !favoritesOnly && params.get('catalogo') !== '1';
const searchInput = document.querySelector('#header-search-input');
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
  document.querySelector('#catalogo').hidden = homeShelves;
  const shelves = document.querySelector('#category-carousels');
  if (shelves) shelves.hidden = !homeShelves;
  if (homeShelves) return;
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
  document.querySelector('#catalog-title').textContent = favoritesOnly ? 'Seus favoritos' : search ? `Resultados para “${search}”` : category || 'Todos os produtos';
  const breadcrumb = document.querySelector('.collection-page .breadcrumbs>span:last-child');
  if (breadcrumb) breadcrumb.textContent = search ? 'Resultados da busca' : category || 'Todos os produtos';
  updateCategoryButtons();
  try {
    let data;
    let products;
    if (favoritesOnly) {
      const response = await api('/api/carrinho/consultar', {method: 'POST', signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({produtoIds: favoriteIds()})});
      products = response.dados.filter(product => (!category || product.categoria === category) && product.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    } else {
      // Agrupar antes de paginar impede que cores do mesmo modelo fiquem em páginas diferentes.
      products = await fetchAllProducts(api, {busca: search, categoria: category}, {signal});
    }
    const groups = groupProducts(products);
    data = {dados: groups.slice((page - 1) * pageSize, page * pageSize), total: groups.length, limite: pageSize};
    if (currentRequest !== requestNumber) return;
    if (page > 1 && !data.dados.length && data.total > 0) { page = 1; return load(); }
    document.querySelector('#result-count').textContent = `${data.total} produto${data.total === 1 ? '' : 's'} encontrado${data.total === 1 ? '' : 's'}`;
    if (!data.dados.length) {
      showState(status, favoritesOnly ? 'Seus próximos favoritos estão por aí.' : search ? `Não encontramos produtos para “${search}”.` : category ? 'Nenhum produto nesta categoria.' : 'O próximo movimento está chegando.',
        favoritesOnly ? 'Toque no coração de um produto para guardá-lo aqui.' : search || category ? 'Use a lupa no cabeçalho para tentar outro termo ou veja todos os produtos.' : 'Estamos preparando nosso catálogo. Volte em breve para conferir as novidades.',
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
  homeShelves = false; favoritesOnly = false; clear();
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
  favoritesOnly = false; category = button.dataset.category; page = 1; load();
};
for (const [id, step] of [['previous-page', -1], ['next-page', 1]]) {
  document.getElementById(id).onclick = () => { page += step; load(); document.querySelector('#catalogo').scrollIntoView(); };
}
async function loadShelves() {
  const host = document.querySelector('#category-carousels');
  if (!host || !homeShelves) return;
  host.setAttribute('aria-busy', 'true');
  host.replaceChildren();
  try {
    const products = await fetchAllProducts(api);
    for (const [index, name] of ['Roupas', 'Tênis', 'Acessórios'].entries()) {
      const section = element('section', 'category-shelf');
      section.setAttribute('aria-labelledby', `shelf-title-${index}`);
      const heading = element('div', 'section-heading shelf-heading');
      const title = element('h2', '', name); title.id = `shelf-title-${index}`;
      const actions = element('div', 'shelf-actions');
      const all = element('a', 'text-link', 'Ver coleção');
      all.href = `/loja?${new URLSearchParams({categoria: name})}#catalogo`;
      actions.append(all);
      const track = element('div', 'product-carousel'); track.id = `shelf-track-${index}`;
      track.setAttribute('aria-label', `Produtos de ${name}`);
      track.tabIndex = 0;
      const controls = [];
      for (const [label, step, symbol] of [['Anterior', -1, '‹'], ['Próximo', 1, '›']]) {
        const button = element('button', 'carousel-control', symbol); button.type = 'button';
        button.setAttribute('aria-label', `${label}: ${name}`);
        button.setAttribute('aria-controls', track.id);
        button.onclick = () => track.scrollBy({left: step * track.clientWidth * .85, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
        controls.push(button); actions.append(button);
      }
      const groups = groupProducts(products.filter(product => product.categoria === name));
      track.append(...groups.map(group => productCard(group.product, group.variants)));
      if (!groups.length) track.append(element('p', 'shelf-empty', 'Novos produtos em breve.'));
      const updateControls = () => {
        controls[0].disabled = track.scrollLeft <= 2;
        controls[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      };
      track.addEventListener('scroll', updateControls, {passive: true});
      if ('ResizeObserver' in window) new ResizeObserver(updateControls).observe(track);
      else window.addEventListener('resize', updateControls, {passive: true});
      heading.append(title, actions); section.append(heading, track); host.append(section);
      requestAnimationFrame(updateControls);
    }
  } catch (error) {
    showState(host, 'Não foi possível carregar as coleções.', error.message, {text: 'Tentar novamente', run: loadShelves});
  } finally { host.setAttribute('aria-busy', 'false'); }
}

// O cabeçalho é montado na importação; a consulta do nome da loja não bloqueia os produtos.
if (!homeShelves) await loadCategories();
await Promise.allSettled([load(), loadShelves(), loadRecent()]);
// Voltar pelo navegador pode restaurar o HTML antigo sem executar os módulos outra vez.
window.addEventListener('pageshow', event => { if (event.persisted) { loadRecent(); if (favoritesOnly) load(); } });
