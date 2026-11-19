import test from 'node:test';
import assert from 'node:assert/strict';
import {groupProducts} from '../app/static/product-variants.mjs';

test('agrupa cores preservando IDs, preços, estoque e ordem dos modelos', () => {
  const products = [
    {id: '1', nome: 'Tênis Impulso Aero Ice', categoria: 'Tênis', preco: '299.90', estoque: 0},
    {id: '2', nome: 'Boné', categoria: 'Acessórios'},
    {id: '3', nome: 'Tênis Impulso Aero Volt', categoria: 'Tênis', preco: '310.00', estoque: 5},
    {id: '4', nome: 'Tênis Impulso Base Black', categoria: 'Tênis'},
  ];
  const groups = groupProducts(products);
  assert.deepEqual(groups.map(g => g.product.id), ['1', '2', '4']);
  assert.deepEqual(groups[0].variants, [products[0], products[2]]);
});

test('não agrupa outros produtos por nomes parecidos ou por categoria diferente', () => {
  const products = [
    {nome: 'Tênis Impulso Aero Ice', categoria: 'Roupas'},
    {nome: 'Tênis Impulso Aero Novo', categoria: 'Tênis'},
    {nome: 'Tênis Impulso Aero Ice', categoria: 'Tênis'},
  ];
  assert.equal(groupProducts(products).length, 3);
});
