import {api, getCart, saveCart, toast, element, icon, setProductImage, money, showState} from './shop.js?v=20261119-header-actions1';
import {cartSummary, toCents} from './shop-core.mjs';

const status = document.querySelector('#cart-status');
const content = document.querySelector('#cart-content');
let products = [];
let changing = false;
let requestNumber = 0;

function save(items) {
  changing = true;
  try { saveCart(items); } finally { changing = false; }
  render();
}

function remove(id) {
  save(getCart().filter(item => item.id !== id));
  toast('Produto removido do carrinho.');
}

function change(id, value) {
  const product = products.find(p => p.id === id);
  const max = Math.min(product?.estoque || 0, 99);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    toast(max ? `Escolha entre 1 e ${max} unidade(s).` : 'Este produto está indisponível. Remova-o para continuar.');
    render(); return;
  }
  save(getCart().map(item => item.id === id ? {...item, quantidade: value} : item));
}

function lineItem(line) {
  const {product, quantidade, id} = line;
  const row = element('article', 'cart-item');
  const image = element('img', 'cart-item-image'); image.width = 110; image.height = 120;
  image.sizes = '110px'; image.decoding = 'async'; image.loading = 'lazy';
  setProductImage(image, product || {nome: 'Produto removido'});
  const info = element('div', 'cart-item-info');
  info.append(element('p', 'product-category', product?.categoria || 'Esportes'));
  const heading = element('h2');
  const title = element(product ? 'a' : 'span', 'cart-item-title', product?.nome || 'Produto não disponível');
  if (product) title.href = `/produtos/${id}`;
  heading.append(title); info.append(heading);
  info.append(element('p', 'cart-item-price', product ? `${money(toCents(product.preco))} por unidade` : 'Este produto foi removido do catálogo.'));
  const controls = element('div', 'cart-item-controls');
  const quantityControl = element('div', 'quantity-control');
  const max = Math.min(product?.estoque || 0, 99);
  const minus = element('button', '', '−'); minus.type = 'button';
  minus.setAttribute('aria-label', `Diminuir quantidade de ${product?.nome || 'produto'}`);
  minus.dataset.focus = `${id}-minus`; minus.disabled = quantidade <= 1 || max === 0;
  minus.onclick = () => change(id, Math.min(max, quantidade - 1));
  const input = element('input'); input.type = 'number'; input.min = 1; input.max = Math.max(1, max); input.step = 1;
  input.value = quantidade; input.inputMode = 'numeric'; input.dataset.focus = `${id}-quantity`;
  input.setAttribute('aria-label', `Quantidade de ${product?.nome || 'produto'}`); input.disabled = max === 0;
  input.onchange = () => change(id, Number(input.value));
  const plus = element('button', '', '+'); plus.type = 'button';
  plus.setAttribute('aria-label', `Aumentar quantidade de ${product?.nome || 'produto'}`);
  plus.dataset.focus = `${id}-plus`; plus.disabled = quantidade >= max;
  plus.onclick = () => change(id, quantidade + 1);
  quantityControl.append(minus, input, plus);
  const trash = element('button', 'remove-button'); trash.type = 'button';
  trash.setAttribute('aria-label', `Remover ${product?.nome || 'produto'} do carrinho`);
  trash.dataset.focus = `${id}-remove`; trash.append(icon('trash')); trash.onclick = () => remove(id);
  controls.append(quantityControl, trash); info.append(controls);
  if (!line.available) info.append(element('p', 'cart-item-warning', !product || !product.estoque ? 'Indisponível. Remova este item do carrinho.' : `Estoque atualizado: apenas ${product.estoque} unidade(s). Ajuste a quantidade.`));
  row.append(image, info, element('p', 'cart-item-total', product ? money(line.subtotal) : '—'));
  return row;
}

function render() {
  const focus = document.activeElement?.dataset.focus;
  const summary = cartSummary(getCart(), products);
  if (!summary.lines.length) {
    content.hidden = true;
    showState(status, 'Seu carrinho está esperando movimento.', 'Explore a loja e escolha seus próximos favoritos.', {text: 'Explorar produtos', href: '/loja'});
    return;
  }
  status.hidden = true; content.hidden = false;
  document.querySelector('#cart-items').replaceChildren(...summary.lines.map(lineItem));
  document.querySelector('#cart-item-count').textContent = `${summary.lines.length} produto(s) no carrinho`;
  document.querySelector('#summary-quantity').textContent = `${summary.quantity} unidade(s)`;
  document.querySelector('#cart-total').textContent = money(summary.total);
  document.querySelector('#availability-note').textContent = summary.available
    ? 'Preços e estoque conferidos ao abrir o carrinho.'
    : 'Há itens indisponíveis ou acima do estoque. Produtos removidos não entram no subtotal.';
  if (focus) {
    const target = [...document.querySelectorAll('[data-focus]')].find(node => node.dataset.focus === focus);
    if (target && !target.disabled) target.focus({preventScroll: true});
  }
}

async function load() {
  const current = ++requestNumber;
  const items = getCart();
  if (!items.length) { products = []; render(); return; }
  content.hidden = true; status.hidden = false; status.textContent = 'Conferindo seus produtos…';
  try {
    const {dados} = await api('/api/carrinho/consultar', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({produtoIds: items.map(item => item.id)}),
    });
    if (current !== requestNumber) return;
    products = dados; render();
  } catch (error) {
    if (current !== requestNumber) return;
    showState(status, 'Seu carrinho está salvo.', `Não conseguimos conferir os produtos agora. ${error.message}`, {text: 'Tentar novamente', run: load});
  }
}

document.querySelector('#clear-cart').onclick = () => {
  if (confirm('Remover todos os produtos do carrinho?')) { save([]); toast('Carrinho esvaziado.'); }
};
window.addEventListener('cartchange', () => { if (!changing) load(); });
window.addEventListener('focus', load);
await load();
