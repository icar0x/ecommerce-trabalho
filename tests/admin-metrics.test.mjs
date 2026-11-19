import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_GOALS, normalizeGoals, summarizeProducts} from '../app/static/admin-metrics.mjs';

test('calcula estoque, valor em centavos e categorias incluindo produtos esgotados', () => {
  const products = [
    {nome: 'Camiseta', categoria: 'Roupas', preco: '79.90', estoque: 3, descricao: 'Algodão', imagemUrl: '/foto.png'},
    {nome: 'Tênis', categoria: 'Tênis', preco: '249.90', estoque: 2, descricao: '', imagemUrl: '/foto.png'},
    {nome: 'Bolsa', categoria: 'Acessórios', preco: '0.10', estoque: 0, descricao: 'Bolsa', imagemUrl: null},
  ];
  const data = summarizeProducts(products, 2);
  assert.equal(data.count, 3);
  assert.equal(data.units, 5);
  assert.equal(data.valueCents, 73950n);
  assert.equal(data.complete, 1);
  assert.deepEqual(data.lowStock.map(p => p.nome), ['Bolsa', 'Tênis']);
  assert.deepEqual(data.categories.map(c => [c.products, c.units]), [[1, 3], [1, 2], [1, 0]]);
});

test('catálogo vazio tem indicadores zerados e categorias preservadas', () => {
  const data = summarizeProducts([]);
  assert.equal(data.count, 0);
  assert.equal(data.units, 0);
  assert.equal(data.valueCents, 0n);
  assert.equal(data.complete, 0);
  assert.deepEqual(data.lowStock, []);
  assert.equal(data.categories.length, 3);
});

test('metas rejeitam valores adulterados e aceitam limite de alerta zero', () => {
  assert.deepEqual(normalizeGoals(null), DEFAULT_GOALS);
  assert.deepEqual(normalizeGoals({products: -1, units: '500', threshold: 1.5}), DEFAULT_GOALS);
  assert.deepEqual(normalizeGoals({products: 30, units: 600, threshold: 0}), {products: 30, units: 600, threshold: 0});
  assert.deepEqual(normalizeGoals({products: Infinity, units: 100000001, threshold: -1}), DEFAULT_GOALS);
});

test('valor potencial mantém centavos exatos mesmo com preços e estoques máximos', () => {
  const result = summarizeProducts([{nome: 'Produto', categoria: 'Roupas', preco: '9999999999.99', estoque: 2147483647}]);
  assert.equal(result.valueCents, 999999999999n * 2147483647n);
});
