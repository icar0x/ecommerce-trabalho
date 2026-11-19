import {api, ready, getCart, addToCart, toast, money, toCents, setProductImage, loadRecent, showState} from './shop.js';

const id = location.pathname.split('/').filter(Boolean).at(-1);
const quantity = document.querySelector('#quantity');
const add = document.querySelector('#add-product');
let product;
let max = 0;

function updateQuantityControls() {
  if (!product) return;
  const inCart = getCart().find(item => item.id === product.id)?.quantidade || 0;
  max = Math.max(0, Math.min(product.estoque, 99) - inCart);
  quantity.max = Math.max(1, max);
  quantity.disabled = max === 0; add.disabled = max === 0;
  if (max > 0 && Number(quantity.value) > max) quantity.value = max;
  document.querySelector('#minus').disabled = max === 0 || Number(quantity.value) <= 1;
  document.querySelector('#plus').disabled = max === 0 || Number(quantity.value) >= max;
  const stock = document.querySelector('#product-stock');
  stock.textContent = product.estoque === 0 ? 'Produto esgotado no momento.' : max === 0
    ? 'Você já adicionou a quantidade disponível ao carrinho.' : `${product.estoque} unidade(s) em estoque`;
  stock.classList.toggle('unavailable', max === 0);
}

for (const [button, step] of [['minus', -1], ['plus', 1]]) {
  document.getElementById(button).onclick = () => { quantity.value = Math.max(1, Math.min(max, (Number(quantity.value) || 1) + step)); updateQuantityControls(); };
}
quantity.oninput = updateQuantityControls;
window.addEventListener('cartchange', updateQuantityControls);
document.querySelector('#add-form').onsubmit = event => {
  event.preventDefault();
  try { addToCart(product, Number(quantity.value)); updateQuantityControls(); }
  catch (error) { toast(error.message); }
};

async function load() {
  const status = document.querySelector('#product-status');
  status.hidden = false; status.textContent = 'Carregando produto…';
  try {
    const {dados} = await api(`/api/produtos/${id}`); product = dados;
    const store = await ready;
    document.title = `${product.nome} • ${store.nome}`;
    for (const key of ['product-name', 'breadcrumb-product']) document.getElementById(key).textContent = product.nome;
    document.querySelector('#product-category').textContent = product.categoria || 'Esportes';
    document.querySelector('#product-price').textContent = money(toCents(product.preco));
    document.querySelector('#product-description').textContent = product.descricao || 'Feito para acompanhar o seu próximo movimento.';
    setProductImage(document.querySelector('#product-image'), product, () => { document.querySelector('#image-note').hidden = false; });
    updateQuantityControls();
    status.hidden = true; document.querySelector('#product-detail').hidden = false;
    // A consulta do produto não registra visualização: o POST é explícito.
    try {
      await api('/api/recentes', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({produtoId: id})});
    } catch { document.querySelector('#history-message').textContent = 'Não foi possível atualizar seus vistos recentemente. Você pode continuar comprando.'; }
    await loadRecent(id);
  } catch (error) {
    showState(status, error.status === 404 ? 'Este produto não está mais disponível.' : 'Não foi possível abrir este produto.',
      error.status === 404 ? 'Explore o catálogo e encontre seu próximo favorito.' : error.message,
      error.status === 404 ? {text: 'Explorar produtos', href: '/#catalogo'} : {text: 'Tentar novamente', run: load});
  }
}
await ready;
await load();
