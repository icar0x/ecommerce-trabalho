# Memória do projeto para o próximo chat

Atualizada em 19/11/2026. Este arquivo registra o estado do trabalho; novas instruções do usuário podem alterá-lo.

## Projeto e objetivo

- Pasta local: `C:\Users\Usuario\ecomerce-trabalho`.
- GitHub: https://github.com/icar0x/ecommerce-trabalho.git
- Branch: `main`.
- Trabalho acadêmico de Banco de Dados, entrega em 26/11, com repositório e vídeo demonstrativo.
- O usuário assumiu o projeto inteiro; não há mais uma parte pendente atribuída ao colega.
- Loja com nome provisório Impulso, artigos de marca própria, catálogo, carrinho e futura finalização por WhatsApp.

## Últimas decisões — preservar na continuação

1. Únicas categorias: **Roupas, Tênis e Acessórios**. Não reintroduzir Equipamentos ou Calçados como categoria principal.
2. Manter o layout inspirado na referência de loja de calçados enviada: cabeçalho compacto, banner fotográfico, categorias visuais, cartões compactos, faixa editorial e rodapé preto em colunas.
3. **A logo enviada e a adaptação em verde-limão foram retiradas da versão salva**, a pedido do usuário, pois serão alteradas. A loja voltou ao nome textual e à paleta provisória preto/branco/cinza com acento dourado. Não restaurar a logo nem a paleta adiada automaticamente.
4. **Descartar os prompts anteriores das camisas.** O usuário testará outros. Nenhuma coleção de camisas foi gerada ou cadastrada a partir desses prompts. Não usar os prompts antigos como briefing aprovado.
5. O usuário pediu prompts para produtos próprios; a discussão era exploratória, sem aprovação de uma coleção definitiva. A geração/cadastro do catálogo real ainda está pendente.
6. **WhatsApp adiado explicitamente**: não há número definido, envio de mensagem ou criação de pedido. Concluir o frontend e os produtos primeiro.
7. Não adicionar pagamento, frete, cadastro de clientes, gestão de pedidos ou baixa automática de estoque sem novo pedido.

## Estado salvo no Git

- `a919139`: backend/painel inicial, enviado ao GitHub.
- `59d241b`: vitrine, favoritos, carrinho, categorias definidas, testes e documentação. **Commit local, ainda não enviado ao GitHub.** Exclui a logo e sua paleta adiada.
- O pedido mais recente é salvar esta memória para abrir outro chat; não é uma solicitação de novo push ou deploy.
- `.vscode/` é configuração local não versionada, deixada intacta.
- `.env`, `.venv/`, caches e `.artifacts/` estão fora do Git. Não versionar credenciais.
- Há uma cópia local da logo/paleta adiadas em `.artifacts/identidade-adiada-*`; não é parte da versão de entrega e não deve ser aplicada sem solicitação.

## Implementação pronta

- FastAPI com PyMongo, redis-py e Supabase Auth via REST/httpx.
- HTML, CSS e JavaScript simples servidos pela própria aplicação; sem framework de frontend.
- Configuração em `app/config.py`, carregando `.env` na raiz. Valores padrão do código não contêm credenciais reais.
- Login/logout de administrador, validação de token pelo Supabase e autorização por UUID em `ADMIN_USER_IDS`.
- Painel com CRUD, busca, filtros, mensagens e confirmação de exclusão.
- Campo de preço com máscara automática: digitar `7990` exibe `79,90`. A mensagem explicativa abaixo do campo foi removida a pedido do usuário.
- Categoria obrigatória, com seleção das três opções no painel e validação correspondente na API.
- Dinheiro: Decimal em Python, Decimal128 no MongoDB, string de duas casas no JSON. Frontend calcula em centavos inteiros.
- Vitrine com busca, categorias, paginação, estados vazios/erro, fotos ilustrativas locais e fallback de imagem.
- Detalhes registram a visita por POST explícito, sem efeito automático no GET do produto.
- Redis: cookie UUID anônimo `visitante`, HttpOnly; até dez IDs sem duplicatas, mais recente primeiro, TTL de sete dias renovado no POST. Dados atuais vêm do MongoDB; excluídos são ignorados.
- Carrinho no localStorage `impulso_cart_v1`, somente IDs e quantidades; limite de 50 produtos e 99 unidades por produto, observando estoque. Consulta dados atuais, sinaliza indisponibilidade e não reserva estoque.
- Favoritos no localStorage `impulso_favorites_v1`, com corações funcionais e página filtrada `/?favoritos=1#catalogo`.
- Seed idempotente em `scripts/seed.py`: quatro exemplos genéricos, sem apagar nem sobrescrever produtos. Esses exemplos não são uma coleção definitiva aprovada.

## Arquivos relevantes

- `app/main.py`: aplicação, rotas, serviços e respostas.
- `app/models.py`: campos, validações e categorias permitidas.
- `app/auth.py`: Supabase Auth e lista de administradores.
- `app/static/index.html`, `catalog.js`: vitrine e filtros/favoritos.
- `app/static/product.html`, `product.js`: detalhes e histórico.
- `app/static/cart.html`, `cart.js`: carrinho.
- `app/static/shop.js`, `shop-core.mjs`, `shop.css`: componentes, persistência, dinheiro e estilo da loja.
- `app/static/admin.html`, `admin.js`, `login.html`, `login.js`, `style.css`: administração.
- `app/static/assets/`: banner de tênis gerado e fotografias locais de categorias; origens/prompt em seu README. Não há logo ativa.
- `README.md`, `DESIGN.md`, `VERIFICACAO.md`: execução, contrato da API, decisões visuais e evidências de testes.

## Serviços e testes

Em 19/11, MongoDB Atlas, Redis na nuvem e Supabase responderam a verificações reais. Credenciais estão exclusivamente no `.env`, não neste documento.

- MongoDB: ping, leitura e CRUD temporário verificados; último catálogo consultado estava vazio.
- Redis: ping, transação, leitura e expiração verificados, com limpeza das chaves temporárias.
- Supabase: chave pública aceita; token inválido rejeitado. Cadastro público desativado. Login válido e CRUD no painel confirmados pelo usuário na primeira etapa; não há senha de login armazenada para automação.
- Última suíte: **23 testes Python aprovados e 3 testes JavaScript aprovados**.
- QA no Edge headless com bancos reais: catálogo, categorias, favoritos, detalhes, histórico isolado, carrinho persistente, preços/estoque atualizados, exclusão e layouts mobile. Os dados temporários de teste foram removidos.
- Um aviso de depreciação do TestClient/Starlette não impede os testes.
- `scripts/check_frontend.py` é QA opcional com Playwright e Edge instalados. Cria dois produtos temporários e remove seus próprios dados ao final; não usa o perfil pessoal do navegador.

## Executar e conferir

Na raiz do projeto, PowerShell:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Antes de iniciar, conferir se já há servidor na porta 8000. Não encerrar processos desconhecidos. O servidor foi deixado rodando no chat anterior; pode ou não sobreviver à troca de chat. Para mudanças de Python sem `--reload`, reiniciar a aplicação. Para alterações estáticas, atualizar o navegador com Ctrl+F5.

- Loja: http://127.0.0.1:8000/
- Carrinho: http://127.0.0.1:8000/carrinho
- Login: http://127.0.0.1:8000/admin/login
- Painel: http://127.0.0.1:8000/admin
- Swagger: http://127.0.0.1:8000/docs

```powershell
.\.venv\Scripts\python.exe -m pytest -q
node --test tests/shop-core.test.mjs
# Somente se quiser inserir os quatro exemplos genéricos no banco configurado:
.\.venv\Scripts\python.exe -m scripts.seed
```

Se precisar testar a rede, não imprimir URIs, chaves ou senhas. Não confundir testes com mocks com integrações reais. As conexões podem precisar de autorização para sair do sandbox.

## Próximos passos possíveis

Seguir a nova orientação do usuário sobre logo, identidade e produtos. Depois, gerar/selecionar imagens e cadastrar a coleção aprovada. Em uma etapa posterior, definir o número e implementar WhatsApp. O push do commit de frontend e a entrega/vídeo ainda estão pendentes. Não retomar os prompts descartados das camisas nem publicar automaticamente.
