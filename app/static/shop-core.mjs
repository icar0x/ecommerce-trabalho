// Preços e totais são calculados em centavos inteiros, sem somar floats.
export const CART_KEY = 'impulso_cart_v1';
export const MAX_ITEMS = 50;
export const MAX_QUANTITY = 99;

export function toCents(value) {
  if (typeof value !== 'string' || !/^\d{1,10}\.\d{2}$/.test(value)) {
    throw new Error('Preço inválido.');
  }
  const [whole, fraction] = value.split('.');
  return Number(whole) * 100 + Number(fraction);
}

export function money(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Total inválido.');
  const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${whole},${String(cents % 100).padStart(2, '0')}`;
}

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const items = new Map();
  for (const item of value) {
    if (!item || typeof item.id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(item.id)) continue;
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1) continue;
    const id = item.id.toLowerCase();
    if (!items.has(id) && items.size >= MAX_ITEMS) continue;
    items.set(id, Math.min(MAX_QUANTITY, (items.get(id) || 0) + item.quantidade));
  }
  return [...items].map(([id, quantidade]) => ({id, quantidade}));
}

export function cartCount(items) {
  return items.reduce((sum, item) => sum + item.quantidade, 0);
}

export function cartSummary(items, products) {
  const byId = new Map(products.map(product => [product.id, product]));
  const lines = items.map(item => {
    const product = byId.get(item.id) || null;
    const available = Boolean(product && product.estoque >= item.quantidade);
    const subtotal = product ? toCents(product.preco) * item.quantidade : 0;
    return {...item, product, available, subtotal};
  });
  return {
    lines,
    total: lines.reduce((sum, line) => sum + line.subtotal, 0),
    quantity: cartCount(items),
    available: lines.length > 0 && lines.every(line => line.available),
  };
}
