import {initDashboard, refreshDashboard} from './admin-dashboard.js?v=20261119-footer-logo1';

const token = sessionStorage.getItem('admin_token');
if (!token) location.replace('/admin/login');
const form = document.querySelector('#product-form');
const message = document.querySelector('#message');
let editing = null;
let page = 1;
const fields = ['nome', 'descricao', 'preco', 'estoque', 'categoria', 'imagemUrl'];
const priceInput = form.elements.preco;

function priceDigits(value) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function formatPrice(value) {
  const digits = priceDigits(value);
  if (!digits) return '';
  const padded = digits.padStart(3, '0');
  const reais = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${reais},${padded.slice(-2)}`;
}

priceInput.addEventListener('input', () => {
  const digits = priceDigits(priceInput.value);
  priceInput.value = formatPrice(priceInput.value);
  priceInput.setCustomValidity(digits.length > 12
    ? 'O preço máximo é R$ 9.999.999.999,99.'
    : digits && !/[1-9]/.test(digits) ? 'Informe um preço maior que zero.' : '');
});

async function api(path, options = {}) {
  const response = await fetch(path, {...options, headers: {
    'Content-Type': 'application/json', Authorization: `Bearer ${token}`,
  }});
  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem('admin_token');
    location.replace('/admin/login');
    throw new Error('Sua sessão terminou. Entre novamente.');
  }
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error([data.erro?.mensagem, ...(data.erro?.campos || []).map(e => `${e.campo}: ${e.mensagem}`)].filter(Boolean).join(' '));
  return data;
}

function reset() {
  editing = null;
  form.reset();
  priceInput.setCustomValidity('');
  document.querySelector('#form-title').textContent = 'Novo produto';
}

function editProduct(product) {
  editing = product.id;
  for (const field of fields) form.elements[field].value = product[field] ?? '';
  priceInput.value = formatPrice(product.preco);
  priceInput.setCustomValidity('');
  document.querySelector('#form-title').textContent = 'Editar produto';
  document.querySelector('#gestao-produtos').scrollIntoView();
  form.nome.focus({preventScroll: true});
}

document.querySelector('#new-product').onclick = () => {
  reset(); document.querySelector('#gestao-produtos').scrollIntoView(); form.nome.focus({preventScroll: true});
};

async function load() {
  const params = new URLSearchParams({busca: document.querySelector('#busca').value,
    categoria: document.querySelector('#filter-category').value, pagina: page, limite: 20});
  const data = await api(`/api/produtos?${params}`);
  const tbody = document.querySelector('#products');
  tbody.replaceChildren();
  document.querySelector('#count').textContent = `${data.total} produto(s) encontrado(s)`;
  document.querySelector('#page').textContent = `Página ${page}`;
  document.querySelector('#previous').disabled = page === 1;
  document.querySelector('#next').disabled = page * 20 >= data.total;
  for (const product of data.dados) {
    const row = document.createElement('tr');
    for (const text of [product.nome, Number(product.preco).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), product.estoque]) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    const category = document.createElement('span'); category.className = 'admin-product-category'; category.textContent = product.categoria;
    row.firstElementChild.append(category);
    const stockCell = row.children[2]; stockCell.replaceChildren();
    row.children[1].dataset.label = 'Preço'; stockCell.dataset.label = 'Estoque';
    const badge = document.createElement('span'); badge.className = 'admin-stock-badge'; badge.textContent = product.estoque;
    stockCell.append(badge);
    const actions = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Editar'; edit.className = 'secondary small';
    edit.onclick = () => editProduct(product);
    const remove = document.createElement('button');
    remove.textContent = 'Excluir'; remove.className = 'danger small';
    remove.onclick = async () => {
      if (!confirm(`Excluir “${product.nome}”? Esta ação não pode ser desfeita.`)) return;
      remove.disabled = true;
      try {
        await api(`/api/produtos/${product.id}`, {method: 'DELETE'});
        if (editing === product.id) reset();
        message.textContent = 'Produto excluído.';
        await Promise.all([load(), refreshDashboard()]);
      } catch (error) { message.textContent = error.message; remove.disabled = false; }
    };
    actions.append(edit, remove); row.append(actions); tbody.append(row);
  }
}

form.onsubmit = async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type=submit]'); button.disabled = true;
  const body = Object.fromEntries(fields.map(field => [field, form.elements[field].value]));
  body.preco = body.preco.replace(/\./g, '').replace(',', '.');
  body.estoque = Number(body.estoque);
  body.imagemUrl = body.imagemUrl || null;
  try {
    await api(editing ? `/api/produtos/${editing}` : '/api/produtos', {method: editing ? 'PUT' : 'POST', body: JSON.stringify(body)});
    reset(); message.textContent = 'Produto salvo com sucesso.'; await Promise.all([load(), refreshDashboard()]);
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
};
document.querySelector('#cancel').onclick = reset;
document.querySelector('#search-form').onsubmit = (event) => { event.preventDefault(); page = 1; load().catch(e => { message.textContent = e.message; }); };
for (const [id, step] of [['previous', -1], ['next', 1]]) {
  document.getElementById(id).onclick = () => { page += step; load().catch(e => { message.textContent = e.message; }); };
}
document.querySelector('#logout').onclick = async () => {
  try { await api('/api/auth/logout', {method: 'POST'}); }
  catch (error) { message.textContent = error.message; }
  finally { sessionStorage.removeItem('admin_token'); location.replace('/admin/login'); }
};
if (token) api('/api/auth/me').then(({dados}) => {
  initDashboard(api, dados.id, editProduct);
  return Promise.all([load(), refreshDashboard()]);
}).catch(e => { message.textContent = e.message; });
