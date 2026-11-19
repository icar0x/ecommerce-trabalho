import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchAllProducts} from '../app/static/products-api.mjs';

test('consulta todas as páginas preservando filtros e sinal de cancelamento', async () => {
  const signal = new AbortController().signal;
  const seen = [];
  const api = async (url, options) => {
    const query = new URL(url, 'https://local.test').searchParams;
    seen.push(query.get('pagina'));
    assert.equal(query.get('busca'), 'tênis');
    assert.equal(query.get('categoria'), 'Tênis');
    assert.equal(query.get('limite'), '100');
    assert.equal(options.signal, signal);
    return {dados: query.get('pagina') === '1' ? [{id: 'a'}] : [{id: 'b'}], total: 2};
  };
  assert.deepEqual(await fetchAllProducts(api, {busca: 'tênis', categoria: 'Tênis'}, {signal}), [{id: 'a'}, {id: 'b'}]);
  assert.deepEqual(seen, ['1', '2']);
});

test('interrompe paginação ao esvaziar uma página após mudança do catálogo', async () => {
  let calls = 0;
  const result = await fetchAllProducts(async () => ({dados: ++calls === 1 ? [{id: 'a'}] : [], total: 100}));
  assert.deepEqual(result, [{id: 'a'}]);
  assert.equal(calls, 2);
  await assert.rejects(fetchAllProducts(async () => { throw new Error('indisponível'); }), /indisponível/);
});
