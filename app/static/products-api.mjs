// Agrupa todas as páginas antes de calcular variantes ou indicadores.
export async function fetchAllProducts(api, filters = {}, options = {}) {
  const query = new URLSearchParams({...filters, pagina: 1, limite: 100});
  const products = [];
  for (let page = 1; ; page++) {
    query.set('pagina', page);
    const response = await api(`/api/produtos?${query}`, options);
    products.push(...response.dados);
    if (!response.dados.length || products.length >= response.total) return products;
  }
}
