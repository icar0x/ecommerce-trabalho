import {DEFAULT_GOALS, normalizeGoals, summarizeProducts} from './admin-metrics.mjs';
import {fetchAllProducts} from './products-api.mjs';

const COLORS = ['#a8dc3c', '#394832', '#91a684'];
const integer = value => value.toLocaleString('pt-BR');
const money = cents => `R$ ${(cents / 100n).toLocaleString('pt-BR')},${String(cents % 100n).padStart(2, '0')}`;
let products = [], goals = {...DEFAULT_GOALS}, storageKey, hasSavedGoals = false, storageFailed = false, initialized = false;
let fetchApi, editProduct, refreshNumber = 0;

function node(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}

function render() {
  const data = summarizeProducts(products, goals.threshold);
  for (const [id, value] of [['metric-products', integer(data.count)], ['metric-units', integer(data.units)], ['metric-value', money(data.valueCents)], ['metric-low', integer(data.lowStock.length)], ['mix-total', integer(data.count)]]) document.getElementById(id).textContent = value;
  document.querySelector('#low-stock-caption').textContent = `Com até ${integer(goals.threshold)} unidades disponíveis`;
  const stockChart = document.querySelector('#stock-chart'); stockChart.replaceChildren();
  const legend = document.querySelector('#mix-legend'); legend.replaceChildren();
  const donut = document.querySelector('#category-donut');
  donut.querySelectorAll('.donut-segment').forEach(item => item.remove());
  let offset = 0;
  for (const [index, category] of data.categories.entries()) {
    const bar = node('div', 'stock-bar'); bar.style.setProperty('--chart-color', COLORS[index]);
    const label = node('div', 'stock-bar-label'); label.append(node('span', '', category.name), node('strong', '', integer(category.units)));
    const meter = node('meter'); meter.min = 0; meter.max = Math.max(1, ...data.categories.map(item => item.units)); meter.value = category.units;
    meter.setAttribute('aria-label', `${category.name}: ${category.units} unidades`); bar.append(label, meter); stockChart.append(bar);
    const share = data.count ? category.products / data.count * 100 : 0;
    const row = node('div', 'legend-row'); row.style.setProperty('--chart-color', COLORS[index]);
    row.append(node('span', 'legend-dot'), node('span', '', category.name), node('strong', '', integer(category.products)), node('small', '', `${Math.round(share)}% do catálogo`)); legend.append(row);
    if (share > 0) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      for (const [key, value] of Object.entries({cx: 60, cy: 60, r: 46, fill: 'none', stroke: COLORS[index], 'stroke-width': 14, pathLength: 100, 'stroke-dasharray': `${share} ${100 - share}`, 'stroke-dashoffset': -offset, transform: 'rotate(-90 60 60)', class: 'donut-segment'})) circle.setAttribute(key, value);
      donut.append(circle); offset += share;
    }
  }
  donut.setAttribute('aria-label', data.categories.map(item => `${item.name}: ${item.products} produtos`).join('; '));
  stockChart.setAttribute('aria-busy', 'false');
  const goalList = document.querySelector('#goals-progress'); goalList.replaceChildren();
  for (const [name, current, target, unit] of [['Ampliar o catálogo', data.count, goals.products, 'produtos'], ['Disponibilidade de estoque', data.units, goals.units, 'unidades'], ['Produtos com foto e descrição', data.complete, data.count, 'produtos completos']]) {
    const percent = target ? Math.round(current / target * 100) : 0;
    const row = node('div', 'goal-row');
    const label = node('div', 'goal-label'); label.append(node('span', '', name), node('strong', '', `${percent}%`));
    const progress = node('progress'); progress.max = Math.max(1, target); progress.value = Math.min(current, target); progress.setAttribute('aria-label', `${name}: ${current} de ${target}`);
    const detail = node('div', 'goal-detail'); detail.append(node('span', '', `${integer(current)} de ${integer(target)} ${unit}`), node('span', '', target && current >= target ? 'Meta atingida' : 'Em andamento'));
    row.append(label, progress, detail); goalList.append(row);
  }
  document.querySelector('#goals-note').textContent = storageFailed ? 'Não foi possível salvar neste navegador. Metas aplicadas apenas nesta visita.' : hasSavedGoals ? 'Metas personalizadas, salvas neste navegador para a sua conta.' : 'Metas iniciais sugeridas. Personalize para o seu planejamento.';
  document.querySelector('#attention-count').textContent = `${data.lowStock.length} ${data.lowStock.length === 1 ? 'produto' : 'produtos'}`;
  const attention = document.querySelector('#stock-attention'); attention.replaceChildren();
  if (!data.lowStock.length) {
    const ok = node('div', 'stock-ok'); ok.append(node('strong', '', data.count ? 'Tudo em dia por aqui.' : 'Seu catálogo começa aqui.'), node('p', '', data.count ? 'Nenhum produto abaixo do limite de estoque definido.' : 'Cadastre seu primeiro produto para acompanhar os indicadores.')); attention.append(ok);
  }
  for (const product of data.lowStock.slice(0, 4)) {
    const row = node('div', 'attention-row'); const copy = node('div');
    copy.append(node('strong', '', product.nome), node('small', '', `${product.estoque} ${product.estoque === 1 ? 'unidade disponível' : 'unidades disponíveis'}`));
    const edit = node('button', 'dashboard-text', 'Revisar'); edit.type = 'button'; edit.setAttribute('aria-label', `Revisar estoque de ${product.nome}`); edit.onclick = () => editProduct(product);
    row.append(copy, edit); attention.append(row);
  }
}

export async function refreshDashboard() {
  const request = ++refreshNumber;
  const refresh = document.querySelector('#refresh-dashboard'); refresh.disabled = true;
  document.querySelector('#dashboard-updated').textContent = 'Atualizando indicadores…';
  try {
    const all = await fetchAllProducts(fetchApi);
    if (request !== refreshNumber) return;
    products = all; render(); document.querySelector('#dashboard-error').hidden = true;
    document.querySelector('#dashboard-updated').textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit'})} · Dados do catálogo`;
  } catch {
    if (request !== refreshNumber) return;
    document.querySelector('#dashboard-error').hidden = false;
    document.querySelector('#dashboard-error').textContent = 'Não foi possível atualizar os indicadores. Tente novamente em Atualizar dados.';
    document.querySelector('#dashboard-updated').textContent = products.length ? 'Exibindo a última consulta. Atualização pendente.' : 'Indicadores indisponíveis.';
  } finally { if (request === refreshNumber) refresh.disabled = false; }
}

export function initDashboard(api, userId, onEdit) {
  fetchApi = api; editProduct = onEdit;
  storageKey = `impulso_admin_goals_v1:${userId}`;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) { goals = normalizeGoals(JSON.parse(saved)); hasSavedGoals = true; }
  } catch { /* Metas padrão continuam disponíveis sem armazenamento. */ }
  if (initialized) return;
  initialized = true;
  document.querySelector('#refresh-dashboard').onclick = refreshDashboard;
  const dialog = document.querySelector('#goals-dialog');
  const form = document.querySelector('#goals-form');
  document.querySelector('#edit-goals').onclick = () => {
    for (const key of Object.keys(DEFAULT_GOALS)) form.elements[key].value = goals[key];
    dialog.showModal();
  };
  document.querySelector('#close-goals').onclick = () => dialog.close();
  document.querySelector('#reset-goals').onclick = () => { for (const key of Object.keys(DEFAULT_GOALS)) form.elements[key].value = DEFAULT_GOALS[key]; };
  form.onsubmit = event => {
    event.preventDefault();
    goals = normalizeGoals(Object.fromEntries(Object.keys(DEFAULT_GOALS).map(key => [key, Number(form.elements[key].value)])));
    try { localStorage.setItem(storageKey, JSON.stringify(goals)); hasSavedGoals = true; storageFailed = false; }
    catch { storageFailed = true; hasSavedGoals = false; }
    render(); dialog.close();
  };
  for (const link of document.querySelectorAll('[data-dashboard-link]')) {
    link.addEventListener('click', () => {
      document.querySelectorAll('[data-dashboard-link]').forEach(item => { item.classList.toggle('active', item === link); item.removeAttribute('aria-current'); });
      link.setAttribute('aria-current', 'location');
    });
  }
}
