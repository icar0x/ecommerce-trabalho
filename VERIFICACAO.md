# Verificação local

Ambiente: Windows, Python 3.13.7. Dependências instaladas em `.venv`. Segunda etapa verificada em **19/11/2026**.

- Suíte `python -m pytest -q`: **23 testes aprovados**, cobrindo autenticação simulada, autorização, CRUD e dinheiro, validações, busca/paginação, histórico, seed, páginas, categorias, consulta em lote do carrinho e falhas de serviços. Categoria obrigatória e restrita a Roupas, Tênis e Acessórios; categorias vazias ou fora da lista são rejeitadas.
- Um aviso de depreciação do TestClient/Starlette sobre o transporte httpx; não impede a execução dos testes.
- Compilação dos arquivos Python e `node --check` dos scripts JavaScript.
- `node --test tests/shop-core.test.mjs`: **3 testes aprovados**, verificando dinheiro em centavos, carrinho adulterado, limites, disponibilidade e preços atuais.
- MongoDB Atlas real: PING, contagem e CRUD confirmados. Um produto temporário foi inserido, lido, editado e removido ao final; nenhum produto anterior foi alterado.
- Supabase real: nova consulta de configurações HTTP 200 com chave publishable; token deliberadamente inválido rejeitado com HTTP 403. Login válido e operações administrativas foram confirmados manualmente pelo usuário na primeira etapa; a senha não é armazenada para repetir esse login automaticamente.
- Supabase: cadastro público agora desativado (`disable_signup=true`), confirmado na consulta real.
- Redis na nuvem real: URI extraída do comando redis-cli informado no `.env`. PING, transação LREM/LPUSH/LTRIM/EXPIRE, leitura e TTL de sete dias confirmados; chave temporária removida ao final.
- Frontend da loja: teste em Edge headless com servidor FastAPI e MongoDB/Redis reais. Confirmados busca, detalhe, esgotado, adição, quantidades, subtotais, persistência, dados atualizados, produto excluído, carrinho vazio, armazenamento corrompido, histórico real e isolamento de visitantes. Sem exceções JavaScript. Capturas desktop/mobile em `.artifacts/`, fora do Git. Apenas os produtos e históricos temporários do teste foram removidos ao final.
- WhatsApp foi adiado pelo usuário; não há envio de mensagem ou pedido implementado nesta etapa.
- Redesign conforme referência: paleta neutra, cabeçalho compacto, banner gerado, fotografias de categorias, vitrine compacta, faixa editorial e rodapé em colunas. Layout aplicado também aos detalhes e carrinho. Documentação em `DESIGN.md`.
- Favoritos verificados no Edge: filtro por categoria, adição pelo coração, consulta, persistência após recarregar e remoção. Fluxos de carrinho/histórico verificados novamente com serviços reais, sem exceções JavaScript e sem rolagem lateral em 390 px.

Os testes automatizados não usam conexões reais; as verificações manuais dos serviços estão discriminadas acima. O runtime utiliza PyMongo, redis-py e HTTP para o Supabase, sem simulação automática quando há falha. O roteiro de validação real está no README.
