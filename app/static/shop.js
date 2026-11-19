import {CART_KEY, MAX_ITEMS, MAX_QUANTITY, normalizeCart, cartCount, money, toCents} from './shop-core.mjs';

export {money, toCents};
let cart = [];
let storageAvailable = true;
let toastTimer;
const FAVORITES_KEY = 'impulso_favorites_v1';
let favorites = [];

const paths = {
  bag: '<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  spark: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 10h8M8 14h5"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
  check: '<path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7l8-4Z"/><path d="m8 12 3 3 5-6"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
};

export function icon(name) {
  const holder = document.createElement('span');
  // Somente os paths locais constantes acima entram no SVG, nunca dados da API.
  holder.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  return holder.firstElementChild;
}

export function decorate(root = document) {
  for (const element of root.querySelectorAll('[data-icon]')) element.replaceChildren(icon(element.dataset.icon));
}

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {credentials: 'same-origin', ...options});
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Não foi possível conectar à loja. Confira sua conexão e tente novamente.');
  }
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.erro?.mensagem || 'Não foi possível carregar as informações.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function storageNotice() {
  storageAvailable = false;
  if (document.querySelector('.storage-notice')) return;
  const notice = element('p', 'storage-notice', 'Seu navegador não permitiu salvar o carrinho. Os itens serão mantidos somente nesta página.');
  notice.setAttribute('role', 'status');
  document.querySelector('#shop-header').after(notice);
}

function readCart() {
  let raw;
  try { raw = localStorage.getItem(CART_KEY); }
  catch { storageNotice(); return cart; }
  try { return normalizeCart(JSON.parse(raw || '[]')); }
  catch { return []; }
}

export function getCart() {
  if (storageAvailable) cart = readCart();
  return cart.map(item => ({...item}));
}

export function saveCart(items) {
  cart = normalizeCart(items);
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  catch { storageNotice(); }
  updateBadge();
  window.dispatchEvent(new CustomEvent('cartchange'));
}

export function favoriteIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    favorites = normalizeCart(Array.isArray(raw) ? raw.map(id => ({id, quantidade: 1})) : []).map(item => item.id);
  } catch { /* Preserva favoritos em memória se o armazenamento estiver indisponível. */ }
  return [...favorites];
}

function refreshFavoriteButtons() {
  const ids = favoriteIds();
  for (const button of document.querySelectorAll('[data-favorite-id]')) {
    const selected = ids.includes(button.dataset.favoriteId);
    button.classList.toggle('is-favorite', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
}

function toggleFavorite(id) {
  const ids = favoriteIds();
  const exists = ids.includes(id);
  if (!exists && ids.length >= 50) { toast('Você pode salvar até 50 favoritos.'); return; }
  favorites = exists ? ids.filter(value => value !== id) : [...ids, id];
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }
  catch { toast('Não foi possível salvar seus favoritos neste navegador.'); }
  refreshFavoriteButtons();
  window.dispatchEvent(new CustomEvent('favoriteschange'));
  toast(exists ? 'Produto removido dos favoritos.' : 'Produto salvo nos favoritos.');
}

function updateBadge() {
  const count = cartCount(cart);
  const badge = document.querySelector('#cart-count');
  if (badge) badge.textContent = count;
  document.querySelector('.cart-link')?.setAttribute('aria-label', `Carrinho com ${count} item(ns)`);
}

export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find(item => item.id === product.id);
  const next = (existing?.quantidade || 0) + quantity;
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Informe uma quantidade válida.');
  if (next > Math.min(product.estoque, MAX_QUANTITY)) {
    throw new Error(`Você pode ter até ${Math.min(product.estoque, MAX_QUANTITY)} unidade(s) deste produto no carrinho.`);
  }
  if (!existing && items.length >= MAX_ITEMS) throw new Error('Seu carrinho já tem 50 produtos diferentes.');
  if (existing) existing.quantidade = next;
  else items.push({id: product.id, quantidade: quantity});
  saveCart(items);
  toast(`${product.nome} adicionado ao carrinho.`, true);
}

export function toast(text, cartLink = false) {
  const box = document.querySelector('#toast');
  if (!box) return;
  clearTimeout(toastTimer);
  box.replaceChildren(element('span', '', text));
  if (cartLink) {
    const link = element('a', '', 'Ver carrinho'); link.href = '/carrinho'; box.append(link);
  }
  box.hidden = false;
  toastTimer = setTimeout(() => { box.hidden = true; }, 5000);
}

export function setProductImage(image, product, onFallback) {
  const fallback = '/static/product-placeholder.svg';
  let url = fallback;
  if (product.imagemUrl) {
    try {
      const candidate = new URL(product.imagemUrl);
      if (['http:', 'https:'].includes(candidate.protocol)) url = candidate.href;
    } catch { /* URL inválida recebe ilustração local. */ }
  }
  image.alt = product.nome;
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    image.src = fallback;
    onFallback?.();
  }, {once: true});
  image.src = url;
  if (url === fallback) onFallback?.();
}

export function productCard(product) {
  const card = element('article', 'product-card');
  const photo = element('a', 'product-photo'); photo.href = `/produtos/${product.id}`;
  photo.tabIndex = -1; photo.setAttribute('aria-hidden', 'true');
  const image = element('img'); image.width = 400; image.height = 430; image.loading = 'lazy';
  setProductImage(image, product);
  photo.append(image);
  if (!product.estoque) photo.append(element('span', 'product-badge sold-out', 'Esgotado'));
  const info = element('div', 'product-info');
  const heading = element('h3'); const link = element('a', '', product.nome);
  link.href = `/produtos/${product.id}`; heading.append(link); info.append(heading);
  info.append(element('p', 'product-category', product.categoria || 'Esportes'));
  const bottom = element('div', 'product-bottom');
  bottom.append(element('span', 'product-price', money(toCents(product.preco))));
  const add = element('button', 'add-button'); add.type = 'button';
  add.setAttribute('aria-label', `Adicionar ${product.nome} ao carrinho`); add.disabled = product.estoque < 1;
  add.append(icon('plus'));
  add.onclick = () => { try { addToCart(product); } catch (error) { toast(error.message); } };
  bottom.append(add); info.append(bottom); card.append(photo, info);
  const favorite = element('button', 'favorite-button'); favorite.type = 'button';
  favorite.dataset.favoriteId = product.id;
  favorite.setAttribute('aria-label', `Salvar ${product.nome} nos favoritos`);
  const selected = favoriteIds().includes(product.id);
  favorite.setAttribute('aria-pressed', String(selected));
  favorite.classList.toggle('is-favorite', selected);
  favorite.append(icon('heart')); favorite.onclick = () => toggleFavorite(product.id);
  card.append(favorite);
  return card;
}

export function showState(target, title, text, action) {
  target.hidden = false;
  target.replaceChildren(element('h2', '', title), element('p', '', text));
  if (action) {
    if (action.href) {
      const link = element('a', 'btn btn-dark', action.text); link.href = action.href; target.append(link);
    } else {
      const button = element('button', 'btn btn-dark', action.text); button.type = 'button'; button.onclick = action.run; target.append(button);
    }
  }
}

export async function loadRecent(excludeId = '') {
  const section = document.querySelector('#recent-section');
  if (!section) return;
  try {
    const data = await api('/api/recentes');
    const products = data.dados.filter(product => product.id !== excludeId).slice(0, 5);
    document.querySelector('#recent-grid').replaceChildren(...products.map(productCard));
    section.hidden = products.length === 0;
  } catch {
    section.hidden = true;
    // O histórico indisponível não impede navegação no catálogo.
  }
}

export const ready = (async () => {
  const header = document.querySelector('#shop-header');
  // Estrutura fixa local; o nome configurado é atualizado com textContent.
  header.innerHTML = '<div class="announcement"><span>Seu próximo movimento começa aqui.</span><span class="announcement-divider">|</span><span>Escolha. Combine. Supere.</span></div><div class="header-inner wrap"><a class="brand" href="/" aria-label="Página inicial"><span data-store-name>Impulso</span><span class="brand-dot">.</span></a><nav class="main-nav" aria-label="Navegação principal"><a href="/" data-nav="home">Início</a><a href="/#catalogo">Loja</a><a href="/?categoria=Roupas#catalogo">Roupas</a><a href="/?categoria=T%C3%AAnis#catalogo">Tênis</a><a href="/?categoria=Acess%C3%B3rios#catalogo">Acessórios</a></nav><div class="header-actions"><a class="header-icon search-link" href="/#catalogo" aria-label="Buscar produtos"><span data-icon="search"></span></a><a class="header-icon favorites-link" href="/?favoritos=1#catalogo" aria-label="Meus favoritos"><span data-icon="heart"></span></a><a class="cart-link header-icon" href="/carrinho"><span data-icon="bag"></span><span id="cart-count" class="cart-count">0</span></a><a class="header-icon admin-link" href="/admin/login" aria-label="Área administrativa"><span data-icon="user"></span></a></div></div><nav class="mobile-nav" aria-label="Categorias"><a href="/#catalogo">Loja</a><a href="/?categoria=Roupas#catalogo">Roupas</a><a href="/?categoria=T%C3%AAnis#catalogo">Tênis</a><a href="/?categoria=Acess%C3%B3rios#catalogo">Acessórios</a></nav>';
  document.querySelector('#shop-footer').innerHTML = '<div class="wrap"><div class="footer-top"><div class="footer-about"><a class="brand" href="/"><span data-store-name>Impulso</span><span class="brand-dot">.</span></a><p class="footer-copy">Seu destino para estar em movimento.<br>Esporte, estilo e atitude em um só lugar.</p></div><nav class="footer-column" aria-label="Loja"><h2>LOJA</h2><a href="/#catalogo">Todos os produtos</a><a href="/?categoria=T%C3%AAnis#catalogo">Tênis</a><a href="/?categoria=Roupas#catalogo">Roupas</a><a href="/?categoria=Acess%C3%B3rios#catalogo">Acessórios</a></nav><nav class="footer-column" aria-label="Suas escolhas"><h2>SUAS ESCOLHAS</h2><a href="/carrinho">Meu carrinho</a><a href="/?favoritos=1#catalogo">Meus favoritos</a><a href="/?categoria=Acess%C3%B3rios#catalogo">Acessórios</a></nav><div class="footer-note"><h2>SEMPRE EM MOVIMENTO</h2><p>Encontre o que acompanha o seu ritmo. O próximo passo é seu.</p><a href="/#catalogo" class="footer-explore">Explore a coleção <span data-icon="bag"></span></a></div></div><div class="footer-bottom"><span>© <span id="footer-year"></span> <span data-store-name>Impulso</span>. Projeto acadêmico.</span><a href="/admin/login">Área administrativa</a><span>Feito para acompanhar você.</span></div></div>';
  document.querySelector('#footer-year').textContent = new Date().getFullYear();
  const isHome = location.pathname === '/' && !location.search;
  if (isHome) document.querySelector('[data-nav="home"]').setAttribute('aria-current', 'page');
  document.querySelector('.search-link').onclick = event => {
    const search = document.querySelector('#search');
    if (search) { event.preventDefault(); document.querySelector('#catalogo').scrollIntoView(); search.focus({preventScroll: true}); }
  };
  decorate();
  cart = readCart(); updateBadge();
  window.addEventListener('storage', event => {
    if (event.key === CART_KEY || event.key === null) {
      cart = readCart(); updateBadge(); window.dispatchEvent(new CustomEvent('cartchange'));
    }
    if (event.key === FAVORITES_KEY || event.key === null) { refreshFavoriteButtons(); window.dispatchEvent(new CustomEvent('favoriteschange')); }
  });
  try {
    const {dados} = await api('/api/loja');
    for (const name of document.querySelectorAll('[data-store-name]')) name.textContent = dados.nome;
    document.title = document.title.replace('Impulso', dados.nome);
    return dados;
  } catch { return {nome: 'Impulso'}; }
})();
