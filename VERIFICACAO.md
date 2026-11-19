# Verificação local

Fusão dos heros (19/11): Edge verificou opacidades intermediárias simultâneas de saída/entrada em desktop e celular, altura estável, desaparecimento completo após a transição e bloqueio de foco nos slides inativos com `inert`/`aria-hidden`. Movimento reduzido confirmado com duração de transição zero.

Troca automática dos heros (19/11): Edge confirmou ciclo tênis → Hydrate → roupas → tênis a cada seis segundos, ausência dos seletores, pausa por foco e retomada, mobile sem overflow e preferência por movimento reduzido sem animação de transição. Sem erros JavaScript; `node --check hero.js` aprovado.

Heros próprios (19/11): Edge verificou os três arquivos locais, apenas um slide visível e os controles de seleção nas larguras 1440/1024/768/390/320 px, sem overflow. Confirmados navegação por teclado (incluindo retorno circular), seleção por toque e links das campanhas para Roupas (3 produtos) e Acessórios (5 produtos). Sem exceções JS. `node --check` aprovado em `hero.js` e `catalog.js`. Capturas desktop/mobile `.artifacts/hero-*.png`.

Cards escuros de categorias (19/11): imagens transparentes confirmadas; layout sem overflow em 1440/1024/768/390/320 px. Edge confirmou elevação e retorno dos três objetos com texto estático, filtro Roupas por teclado e filtro Tênis por toque, movimento reduzido sem elevação e ausência de erros JavaScript. Captura `.artifacts/categorias-highlight-final.png`.

Animação dos cards (19/11): Edge com API real verificou inclinação 3D nos dois eixos, brilho verde-limão, retorno ao estado neutro, favoritos, adição ao carrinho e foco de teclado. Em movimento reduzido, o efeito não é aplicado; em dispositivo de toque de 390 px, botão de adicionar funciona sem inclinação ou overflow. Sem exceções JavaScript. Scripts `shop.js` e `product-effects.js` passaram em `node --check`.

Atualização de 19/11/2026: **28 testes Python e 3 JavaScript aprovados** após a inclusão da coleção Impulso. Testes adicionais cobrem os 17 cadastros, acesso às imagens locais, repetição sem duplicatas, preservação de edições e rejeição de caminhos inválidos. No Edge com API/MongoDB reais, confirmados os 17 arquivos de imagem, paginação 12+5, filtros Roupas/Tênis/Acessórios com 3/9/5 itens, detalhes, duas camisetas Motion por R$ 179,80 no carrinho e layout em 390 px sem overflow ou exceções JavaScript. Nova logo PNG confirmada no cabeçalho e rodapé. Capturas em `.artifacts/catalogo-*.png`. QA usa navegador isolado; o carrinho pessoal não é alterado. Não houve criação/remoção de produtos de QA nesta etapa; os 17 produtos aprovados permanecem cadastrados.

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
