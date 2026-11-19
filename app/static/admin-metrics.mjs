export const DEFAULT_GOALS = {products: 20, units: 500, threshold: 10};
export const CATEGORIES = ['Roupas', 'Tênis', 'Acessórios'];

export function normalizeGoals(value) {
  const result = {...DEFAULT_GOALS};
  for (const [key, min, max] of [['products', 1, 100000], ['units', 1, 100000000], ['threshold', 0, 100000]]) {
    if (Number.isSafeInteger(value?.[key]) && value[key] >= min && value[key] <= max) result[key] = value[key];
  }
  return result;
}

export function summarizeProducts(products, threshold = DEFAULT_GOALS.threshold) {
  const categories = CATEGORIES.map(name => ({name, products: 0, units: 0}));
  let units = 0, valueCents = 0n, complete = 0;
  const lowStock = [];
  for (const product of products) {
    const stock = product.estoque;
    const [whole, fraction = ''] = String(product.preco).split('.');
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
    units += stock; valueCents += cents * BigInt(stock);
    if (product.imagemUrl && product.descricao?.trim()) complete++;
    if (stock <= threshold) lowStock.push(product);
    const category = categories.find(item => item.name === product.categoria);
    if (category) { category.products++; category.units += stock; }
  }
  lowStock.sort((a, b) => a.estoque - b.estoque || a.nome.localeCompare(b.nome, 'pt-BR'));
  return {count: products.length, units, valueCents, complete, lowStock, categories};
}
