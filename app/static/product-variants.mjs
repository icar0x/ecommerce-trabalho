// Cores da coleção aprovada. Produtos desconhecidos permanecem independentes.
const families = {
  Aero: ['Graphite', 'Ice', 'Volt'],
  Base: ['Black', 'Chalk', 'Concrete'],
  District: ['Mono', 'Shadow', 'Lime'],
};

export function variantInfo(product) {
  if (product.categoria !== 'Tênis') return null;
  for (const [family, colors] of Object.entries(families)) {
    for (const color of colors) {
      if (product.nome === `Tênis Impulso ${family} ${color}`) return {family, color};
    }
  }
  return null;
}

export function groupProducts(products) {
  const groups = [];
  const familiesFound = new Map();
  for (const product of products) {
    const info = variantInfo(product);
    if (!info) { groups.push({product, variants: []}); continue; }
    let group = familiesFound.get(info.family);
    if (!group) {
      group = {product, variants: []};
      familiesFound.set(info.family, group);
      groups.push(group);
    }
    group.variants.push(product);
  }
  return groups;
}
