# E-commerce de artigos esportivos

Loja de artigos esportivos em Python/FastAPI e HTML/CSS/JavaScript. MongoDB guarda os produtos, Redis guarda o histórico anônimo e Supabase Auth autentica os administradores. Inclui vitrine responsiva, detalhes, vistos recentemente, carrinho no navegador e painel administrativo. A finalização pelo WhatsApp fica para a próxima etapa.

## Executar no Windows PowerShell

Pré-requisitos: Python 3.11 ou superior, Git, um projeto Supabase e MongoDB/Redis acessíveis. Docker Desktop é opcional para executar os dois bancos localmente.

```powershell
git clone https://github.com/icar0x/ecommerce-trabalho.git
cd ecommerce-trabalho
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edite .env antes de utilizar login e bancos.
docker compose up -d
python -m scripts.catalog
python -m uvicorn app.main:app --reload
```

Se a ativação do ambiente for bloqueada, use diretamente `.\.venv\Scripts\python.exe` no lugar de `python`, sem precisar alterar a política de execução. No Linux/macOS: `python3 -m venv .venv` e `source .venv/bin/activate`; os demais comandos são os mesmos. Execute sempre a partir da raiz do repositório.

- Loja: http://127.0.0.1:8000/
- Detalhe: http://127.0.0.1:8000/produtos/ID_DO_PRODUTO
- Carrinho: http://127.0.0.1:8000/carrinho
- Login: http://127.0.0.1:8000/admin/login
- Painel: http://127.0.0.1:8000/admin
- API interativa: http://127.0.0.1:8000/docs

O HTML do painel é público, mas cada escrita na API exige token validado e UUID autorizado. Nenhum dado secreto fica no HTML.

## Configuração dos serviços

No Render, a raiz do repositório inclui `.python-version` com a série 3.13, usando o patch mais recente dessa série. Se existir `PYTHON_VERSION` no painel do serviço, essa variável tem prioridade. Conexões MongoDB com TLS usam o conjunto de certificados do `certifi`, mantendo a validação de certificados e hostname; conexões locais sem TLS e CAs personalizadas na URI continuam respeitadas.

O painel `/admin` inclui visão geral com indicadores do catálogo, estoque por categoria, mix de produtos, alertas de estoque e metas editáveis. O valor potencial do estoque usa preço de venda × quantidade e não representa faturamento; a loja ainda não registra pedidos/vendas. Metas sugeridas de catálogo/estoque podem ser alteradas e ficam salvas por conta **neste navegador**, não são sincronizadas entre dispositivos. Cadastro, edição e exclusão continuam disponíveis na seção Produtos e atualizam os indicadores.

| Variável | Preencher com |
| --- | --- |
| `MONGODB_URI` | URI local ou Atlas com usuário, senha e acesso de rede configurados |
| `MONGODB_DATABASE` | Nome do banco, por exemplo `ecommerce_esportivo` |
| `REDIS_URL` | URL local ou remota; use `rediss://` se o provedor exigir TLS |
| `SUPABASE_URL` | URL do projeto Supabase, sem `/auth/v1` |
| `SUPABASE_KEY` | Chave pública publishable ou anon do projeto |
| `ADMIN_USER_IDS` | UUIDs autorizados separados por vírgula; vazio bloqueia todos |
| `COOKIE_SECURE` | `false` no HTTP local, `true` com HTTPS |
| `LOJA_NOME` | Nome da loja, padrão `Impulso`; pode ser alterado sem editar o HTML |

O `.env` é ignorado pelo Git. Não coloque credenciais no README ou no código. A aplicação não precisa de chave `service_role` nem `sb_secret_...`.

### Supabase

1. Crie um projeto no Supabase e copie a URL e a chave pública para `.env`.
2. Em Authentication > Providers/configuração de e-mail, habilite login por e-mail/senha e desabilite novos cadastros públicos (Allow new users to sign up).
3. Em Authentication > Users, use a opção administrativa de adicionar usuário. Defina e-mail e senha e confirme o e-mail pelo painel, quando necessário.
4. Copie o UUID desse usuário para `ADMIN_USER_IDS`. Ter uma conta no Supabase não concede acesso administrativo por si só.
5. Reinicie a aplicação ao alterar `.env` e entre pelo login local.

O backend chama a API REST oficial do Supabase: `token?grant_type=password` para login, `user` para validar o token em cada ação administrativa e `logout?scope=local` para encerrar a sessão. Não aceita apenas o conteúdo decodificado de um JWT. O frontend guarda somente o access token em `sessionStorage`, removido ao sair; não há renovação automática: ao expirar, entre novamente. O logout revoga a sessão/refresh token no Supabase; um access token já emitido pode permanecer válido até expirar, conforme o funcionamento do Supabase. Remover o UUID da lista bloqueia o usuário após reiniciar o backend.

### MongoDB e Redis

O `compose.yaml` fornece MongoDB e Redis reais com volumes persistentes e portas restritas ao computador local. Para parar sem apagar dados: `docker compose stop`. Se já usa Atlas/Redis remoto, pule o Docker e configure as URLs. Para Atlas, configure o usuário de banco e a lista de IPs permitidos. A coleção `produtos` é criada na primeira inserção; não é preciso criar tabelas no Supabase.

O servidor pode iniciar sem conectar aos bancos; as rotas retornam 503 quando o serviço necessário não está disponível. Abrir uma página HTML não comprova conexão. Não há fallback em memória na execução normal.

## Contrato para o frontend

Todas as rotas usam o prefixo `/api`. Sucesso retorna `{"dados": ...}`; listagem também retorna `total`, `pagina` e `limite`. DELETE e logout retornam 204 sem corpo. Erros: `{"erro":{"mensagem":"..."}}`, com `campos` nas validações. Códigos: 400 ID malformado, 401 credenciais/token ausente ou inválido, 403 usuário sem autorização, 404 produto ausente, 422 campos inválidos e 503 serviço indisponível.

| Método e rota | Uso |
| --- | --- |
| `POST /api/auth/login` | Corpo `{"email":"admin@example.com","password":"sua-senha"}`; retorna access_token, token_type e expires_in em dados |
| `GET /api/auth/me` | Identidade do administrador autenticado |
| `GET /api/admin/diagnostico` | Administrador: verifica MongoDB/Redis e retorna somente status e orientações de conexão, sem credenciais |
| `POST /api/auth/logout` | Encerra sessão autenticada |
| `GET /api/produtos` | Lista pública; parâmetros `busca`, `categoria`, `pagina` (1+) e `limite` (1–100, padrão 100) |
| `GET /api/produtos/{id}` | Produto público |
| `POST /api/produtos` | Cria produto; administrador; 201 |
| `PUT /api/produtos/{id}` | Substitui os campos editáveis; administrador |
| `DELETE /api/produtos/{id}` | Exclui; administrador; 204 |
| `POST /api/recentes` | Corpo `{"produtoId":"<id>"}`; registra visualização |
| `GET /api/recentes` | Produtos atuais do histórico, mais recente primeiro |
| `GET /api/loja` | Nome público da loja; nenhuma credencial é retornada |
| `GET /api/categorias` | Lista fixa: `Roupas`, `Tênis` e `Acessórios`, inclusive com catálogo vazio |
| `POST /api/carrinho/consultar` | Corpo `{"produtoIds":["<id>"]}`; dados atuais de até 50 produtos, sem exigir login |

As rotas protegidas recebem `Authorization: Bearer <access_token>`. No Swagger, use Authorize após obter o token. Busca faz correspondência parcial em nome, categoria e descrição, sem diferenciar maiúsculas ou acentos: `tenis` encontra `Tênis`, `acessorios` encontra `Acessórios`. Todas as palavras devem aparecer no produto, em qualquer ordem e em qualquer um desses campos (ex.: `tenis branco`). O MongoDB usa `$regex` com opção `i` e equivalência de acentos, com comportamento semelhante a `ILIKE '%termo%'`; caracteres especiais, inclusive `%`, `_` e expressões regulares, são tratados literalmente. Categoria usa correspondência exata. A listagem ordena por criação decrescente, com desempate por ID. O painel usa páginas de 20 produtos.

Exemplo de criação/edição (id e datas são gerados no backend):

```json
{
  "nome": "Camiseta esportiva",
  "descricao": "Camiseta para treino",
  "preco": "79.90",
  "categoria": "Roupas",
  "imagemUrl": "https://example.com/camiseta.jpg",
  "estoque": 15
}
```

Exemplo de resposta individual:

```json
{
  "dados": {
    "id": "507f1f77bcf86cd799439011",
    "nome": "Camiseta esportiva",
    "descricao": "Camiseta para treino",
    "preco": "79.90",
    "categoria": "Roupas",
    "imagemUrl": "https://example.com/camiseta.jpg",
    "estoque": 15,
    "criadoEm": "2026-11-14T16:00:00Z",
    "atualizadoEm": "2026-11-14T16:00:00Z"
  }
}
```

**Dinheiro:** `preco` usa `Decimal` em Python e BSON `Decimal128` no MongoDB; na resposta JSON é **string com duas casas decimais**. Prefira enviar string com ponto decimal. Também são aceitos números JSON que respeitem a validação, mas não devem ser usados para cálculos monetários no cliente. Máximo 12 dígitos totais e duas casas; mais de duas casas são rejeitadas, sem arredondamento silencioso. O frontend da loja converte preços em centavos inteiros para somar e multiplicar, e só depois formata o resultado em reais.

Nome e categoria são obrigatórios; categoria aceita apenas `Roupas`, `Tênis` ou `Acessórios`. Descrição pode ser vazia; preço é positivo; estoque é inteiro não negativo (booleanos e frações são rejeitados). Imagem aceita URL HTTP/HTTPS, caminho local `/static/assets/arquivo.png` (PNG, JPG, JPEG ou WebP, com espaços e acentos codificados na URL), `null`, campo omitido ou texto vazio. Caminhos locais não aceitam subpastas ou travessia de diretórios. Sem upload. PUT exige nome, categoria, preço e estoque; campos opcionais omitidos voltam aos padrões. Os timestamps são UTC e ObjectId aparece como `id` string. Campos extras de entrada são rejeitados.

### Cookie e histórico

Ao abrir detalhes de um produto, `product.js` chama explicitamente:

```javascript
const produto = await fetch(`/api/produtos/${id}`).then(r => r.json());
await fetch('/api/recentes', {
  method: 'POST',
  credentials: 'same-origin',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({produtoId: id}),
});
const recentes = await fetch('/api/recentes', {
  credentials: 'same-origin',
}).then(r => r.json());
// produto.dados é um produto; recentes.dados é uma lista.
```

O UUID é criado pelo backend no cookie `visitante` (HttpOnly, SameSite=Lax, validade de 7 dias); não use `document.cookie` nem localStorage para esse identificador. O frontend está em `app/static` e é servido pela mesma aplicação. Não abra os arquivos HTML diretamente nem use Live Server em outra porta. Não há CORS habilitado para origens externas.

O Redis armazena somente IDs em `recentes:<uuid>`. A transação LREM/LPUSH/LTRIM/EXPIRE evita duplicatas, move revisitas ao início e limita a dez itens. O TTL de sete dias é renovado apenas pelo POST; GET não renova o TTL do Redis. GET consulta dados atuais no MongoDB e ignora produtos excluídos. GET de produto não registra histórico. O cookie é anônimo, não uma identidade autenticada; apagar o cookie inicia outro histórico. O estoque só é cadastrado e consultado.

### Frontend e carrinho

- `index.html` / `catalog.js`: carrosséis por categoria, busca, favoritos e recentes; `collection.html` compartilha a listagem paginada.
- `product.html` / `product.js`: detalhes, disponibilidade e quantidade; registra a visita explicitamente no Redis.
- `cart.html` / `cart.js`: quantidades, remoção, esvaziamento e resumo com preços atuais.
- `shop.js`: componentes compartilhados, imagens de apoio, cabeçalho, rodapé e persistência.
- `shop-core.mjs`: normalização do carrinho, centavos e cálculo dos totais; testável com Node.
- `shop.css`: estilos exclusivos da loja, sem alterar o painel administrativo.

O layout da loja segue a referência enviada: preto e branco, acento verde-limão, banner fotográfico, categorias em cartões e rodapé em colunas. A logo atual fornecida pelo usuário está em `app/static/assets/impulso-logo.png`. O sistema visual está descrito em `DESIGN.md`; origem das fotografias e prompt do banner em `app/static/assets/README.md`. As imagens de categorias são locais e ilustrativas; os produtos cadastrados usam suas próprias imagens locais.

Favoritos: o coração dos cartões salva até 50 produtos no localStorage (`impulso_favorites_v1`). O ícone no cabeçalho abre a lista de favoritos, com busca, filtros e dados atuais dos produtos. Funciona sem conta e permanece restrito ao navegador utilizado.

O carrinho guarda somente `{id, quantidade}` no localStorage, na chave `impulso_cart_v1`. Limites: 50 produtos diferentes e 99 unidades por produto, respeitando o estoque exibido. Dados inválidos do armazenamento são descartados; quantidades duplicadas são consolidadas. Mudanças em outra aba atualizam o indicador e o carrinho. Quando o armazenamento está bloqueado, a página avisa que não poderá preservar os itens na navegação.

Ao abrir ou retomar o carrinho, o frontend consulta os dados atuais em uma única chamada a `/api/carrinho/consultar`. Produtos excluídos continuam visíveis para remoção e não entram no subtotal. Estoque insuficiente é sinalizado e pode ser corrigido pelo usuário. Não há reserva nem baixa de estoque. Adicionar ao carrinho não cria um pedido.

Imagens usam a URL cadastrada no painel, com ilustração local de apoio caso não exista ou não carregue. Nomes e descrições são inseridos como texto, sem interpretar HTML. A vitrine trata catálogo vazio, busca sem resultado, carregamento e indisponibilidade da API; falha no histórico não impede consultar o produto.

**WhatsApp adiado:** não há número configurado, botão de envio funcional, pagamento ou criação de pedido. O resumo informa que essa opção estará disponível em breve. O nome `Impulso` é provisório; configure `LOJA_NOME` no `.env` e reinicie para trocar.

## Dados de demonstração

A busca reconhece termos comuns do catálogo: `camisa`/`camisas` encontra camisetas e regatas; `garrafa` encontra o squeeze Hydrate; plurais comuns e termos como `sapatos`/`sneakers` também são aceitos. Os resultados mostram o termo pesquisado no título; “Ver todos os produtos” limpa a busca na própria listagem.

Coleção Impulso aprovada: **17 produtos**, com 3 camisas, 9 tênis (3 modelos em 3 cores) e 5 acessórios. Preços e estoques fictícios autorizados para o trabalho acadêmico. Cada cor de tênis é um produto separado; não há seleção de tamanho ou estoque por numeração.

```powershell
python -m scripts.catalog
```

O catálogo está em `scripts/catalog.json`. O comando valida os arquivos locais antes de inserir e usa `catalogKey` com índice único esparso para não duplicar nem sobrescrever produtos e edições do painel. Não exclui registros anteriores. Camisas: R$ 79,90–99,90; tênis: R$ 249,90–299,90; acessórios: R$ 29,90–159,90. Estoques iniciais fictícios entre 12 e 50 unidades.

## Verificação

Imagens ativas em WebP, com miniaturas responsivas para produtos. Os PNGs originais ficam preservados; URLs antigas do banco são convertidas para a versão otimizada apenas na exibição, sem migrar ou alterar os produtos. Para regenerar os WebPs após instalar as dependências de desenvolvimento:

```powershell
python -m scripts.optimize_images
```

O script usa Pillow somente na preparação dos arquivos, não durante a navegação. O mapeamento está em `app/static/optimized-images.mjs`. O cadastro genérico antigo foi removido; use somente `python -m scripts.catalog` para a coleção aprovada.

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
python -m compileall -q app scripts tests
# Opcional para os testes de lógica do carrinho: Node.js 20+.
node --test
```

Os testes Python usam **mongomock, fakeredis e transporte HTTP simulado**, injetados somente pela fábrica de aplicação. Verificam login e rejeições, autorização das três escritas, CRUD, precisão do preço, validações, busca, histórico separado, ordenação, duplicatas, limite, renovação de TTL, produtos excluídos, páginas, categorias, consulta do carrinho e seed idempotente. Os testes Node verificam centavos, armazenamento adulterado, limites e resumo com estoque atualizado/produtos excluídos. Esses testes não comprovam conectividade com serviços reais.

Para QA de navegador opcional no Windows, com Edge instalado e servidor rodando em `http://127.0.0.1:8000`:

```powershell
python -m pip install playwright
python -m scripts.check_frontend
```

Esse comando usa os serviços **reais do `.env`**, cria dois produtos temporários, verifica os fluxos em navegador isolado e remove seus próprios dados ao final. Não usa o perfil do navegador pessoal. Salva capturas desktop/mobile em `.artifacts/` (ignorado no Git). Não precisa baixar outro navegador: utiliza o Edge instalado. Se o teste for interrompido à força antes da limpeza, remova pelo painel apenas os produtos cujo nome contenha o identificador `QA-` daquela execução.

Para validar integrações reais após preencher `.env`:

1. Suba MongoDB/Redis, execute o seed e consulte `/api/produtos` em `/docs`.
2. Entre com senha correta e incorreta no painel. Autorize o Swagger com o token do login e confirme 401 sem token/com token inválido. Para 403, crie uma segunda conta no Supabase fora da lista e use seu token.
3. Crie, edite, consulte e exclua um produto pelo painel. Confira o documento/Decimal128 no MongoDB Compass ou Atlas.
4. Use o POST de recentes com um produto existente e confira GET. Em janela anônima, confirme histórico vazio. Revisite produtos, teste mais de dez e exclua um deles.
5. Com Redis CLI, use `SCAN 0 MATCH recentes:*` e `TTL recentes:<uuid>` para conferir a expiração próxima de 604800 segundos e sua renovação no POST. Nunca use FLUSHDB para esta verificação.
6. Confirme o logout e a limpeza do token no navegador.

Sem credenciais reais não é possível confirmar o login/Supabase, CRUD persistente ou histórico no Redis remoto. O sucesso dos testes locais não substitui esse roteiro.

## Estado do projeto

- [x] Backend FastAPI, configuração e serviços reais no runtime.
- [x] Login/logout Supabase e autorização por UUID.
- [x] Painel administrativo com cadastro, edição, exclusão confirmada, filtros e mensagens.
- [x] API pública, histórico Redis, seed e testes de regras.
- [x] Documentação do contrato para continuação no mesmo repositório.
- [x] Vitrine, detalhes e layout responsivo do cliente.
- [x] Exibição de recentes e chamada explícita do POST ao abrir detalhes.
- [x] Carrinho em localStorage com dados atuais e totais em centavos.
- [ ] Finalização pelo WhatsApp, adiada a pedido do responsável pelo projeto.
- [ ] Revisão final e vídeo demonstrativo para entrega em 26/11.

Não estão no escopo pagamento, frete, cadastro de clientes, gestão de pedidos e baixa automática de estoque. Nenhum push, deploy ou publicação é feito pela implementação local.

Referências oficiais: [validação de usuário Supabase](https://supabase.com/docs/reference/javascript/auth-getuser), [limites do logout](https://supabase.com/docs/reference/javascript/auth-signout), [Decimal128 para dinheiro](https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/), [transações redis-py](https://redis.io/docs/latest/develop/clients/redis-py/transpipe/).
