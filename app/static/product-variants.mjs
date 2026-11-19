// Cores da coleção aprovada. Produtos desconhecidos permanecem independentes.
const families = {
  Aero: [['Graphite', '#555957'], ['Ice', '#eceee8'], ['Volt', '#171a16']],
  Base: [['Black', '#171717'], ['Chalk', '#ecebe5'], ['Concrete', '#969b94']],
  District: [['Mono', '#e6e6df'], ['Shadow', '#303231'], ['Lime', '#b7ff00']],
};

export function variantInfo(product) {
  if (product.categoria !== 'Tênis') return null;
  for (const [family, colors] of Object.entries(families)) {
    for (const [color, swatch] of colors) {
      if (product.nome === `Tênis Impulso ${family} ${color}`) return {family, color, swatch};
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
