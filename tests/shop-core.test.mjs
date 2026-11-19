import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCart, toCents, money, cartSummary} from '../app/static/shop-core.mjs';

const id = '507f1f77bcf86cd799439011';
const second = '507f1f77bcf86cd799439012';

test('dinheiro conserva centavos sem arredondamento binário', () => {
  assert.equal(toCents('0.10') + toCents('0.20'), 30);
  assert.equal(money(123456), 'R$ 1.234,56');
  assert.equal(money(toCents('9999999999.99')), 'R$ 9.999.999.999,99');
  assert.throws(() => toCents('79,90'));
  assert.throws(() => toCents('1.001'));
  assert.throws(() => money(-1));
});

test('localStorage corrompido ou adulterado não vira quantidade inválida', () => {
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(normalizeCart([{id: 'invalido', quantidade: 2}, {id, quantidade: -1}, {id, quantidade: 1.5}, {id, quantidade: '2'}]), []);
  assert.deepEqual(normalizeCart([{id, quantidade: 60}, {id: id.toUpperCase(), quantidade: 60}]), [{id, quantidade: 99}]);
  const many = Array.from({length: 60}, (_, n) => ({id: n.toString(16).padStart(24, '0'), quantidade: 1}));
  assert.equal(normalizeCart(many).length, 50);
});

test('resumo usa preços atuais, sinaliza falta de estoque e produtos excluídos', () => {
  const cart = [{id, quantidade: 3}, {id: second, quantidade: 2}];
  const summary = cartSummary(cart, [{id, preco: '0.10', estoque: 2}]);
  assert.equal(summary.total, 30);
  assert.equal(summary.quantity, 5);
  assert.equal(summary.available, false);
  assert.equal(summary.lines[0].available, false);
  assert.equal(summary.lines[1].product, null);
  const updated = cartSummary([{id, quantidade: 2}], [{id, preco: '79.90', estoque: 10}]);
  assert.equal(updated.total, 15980);
  assert.equal(updated.available, true);
});
