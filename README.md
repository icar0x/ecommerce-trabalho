# E-commerce de artigos esportivos

Base acadêmica em Python/FastAPI. MongoDB guarda os produtos, Redis guarda o histórico anônimo e Supabase Auth autentica os administradores. A aplicação serve o próprio HTML/CSS/JS. Nenhum cadastro de cliente, carrinho ou pedido é implementado nesta etapa.

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
python -m scripts.seed
python -m uvicorn app.main:app --reload
```

Se a ativação do ambiente for bloqueada, use diretamente `.\.venv\Scripts\python.exe` no lugar de `python`, sem precisar alterar a política de execução. No Linux/macOS: `python3 -m venv .venv` e `source .venv/bin/activate`; os demais comandos são os mesmos. Execute sempre a partir da raiz do repositório.

- Início provisório: http://127.0.0.1:8000/
- Login: http://127.0.0.1:8000/admin/login
- Painel: http://127.0.0.1:8000/admin
- API interativa: http://127.0.0.1:8000/docs

O HTML do painel é público, mas cada escrita na API exige token validado e UUID autorizado. Nenhum dado secreto fica no HTML.

## Configuração dos serviços

| Variável | Preencher com |
| --- | --- |
| `MONGODB_URI` | URI local ou Atlas com usuário, senha e acesso de rede configurados |
| `MONGODB_DATABASE` | Nome do banco, por exemplo `ecommerce_esportivo` |
| `REDIS_URL` | URL local ou remota; use `rediss://` se o provedor exigir TLS |
| `SUPABASE_URL` | URL do projeto Supabase, sem `/auth/v1` |
| `SUPABASE_KEY` | Chave pública publishable ou anon do projeto |
| `ADMIN_USER_IDS` | UUIDs autorizados separados por vírgula; vazio bloqueia todos |
| `COOKIE_SECURE` | `false` no HTTP local, `true` com HTTPS |

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
| `POST /api/auth/logout` | Encerra sessão autenticada |
| `GET /api/produtos` | Lista pública; parâmetros `busca`, `categoria`, `pagina` (1+) e `limite` (1–100, padrão 100) |
| `GET /api/produtos/{id}` | Produto público |
| `POST /api/produtos` | Cria produto; administrador; 201 |
| `PUT /api/produtos/{id}` | Substitui os campos editáveis; administrador |
| `DELETE /api/produtos/{id}` | Exclui; administrador; 204 |
| `POST /api/recentes` | Corpo `{"produtoId":"<id>"}`; registra visualização |
| `GET /api/recentes` | Produtos atuais do histórico, mais recente primeiro |

As rotas protegidas recebem `Authorization: Bearer <access_token>`. No Swagger, use Authorize após obter o token. Busca faz correspondência parcial por nome sem diferenciar maiúsculas; caracteres de expressão regular são tratados literalmente. Categoria usa correspondência exata. A listagem ordena por criação decrescente, com desempate por ID. O painel usa páginas de 20 produtos.

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

**Dinheiro:** `preco` usa `Decimal` em Python e BSON `Decimal128` no MongoDB; na resposta JSON é **string com duas casas decimais**. Prefira enviar string com ponto decimal. Também são aceitos números JSON que respeitem a validação, mas não devem ser usados para cálculos monetários no cliente. Máximo 12 dígitos totais e duas casas; mais de duas casas são rejeitadas, sem arredondamento silencioso. Para o carrinho futuro, converta a string em centavos inteiros antes de somar; `Number(preco)` é adequado apenas para formatar a exibição.

Nome é obrigatório; descrição e categoria podem ser vazias; preço é positivo; estoque é inteiro não negativo (booleanos e frações são rejeitados). Imagem aceita apenas URL HTTP/HTTPS, `null`, campo omitido ou texto vazio. Sem upload. PUT exige nome, preço e estoque; campos opcionais omitidos voltam aos padrões. Os timestamps são UTC e ObjectId aparece como `id` string. Campos extras de entrada são rejeitados.

### Cookie e histórico

Ao abrir detalhes de um produto, o colega deve chamar explicitamente:

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

O UUID é criado pelo backend no cookie `visitante` (HttpOnly, SameSite=Lax, validade de 7 dias); não use `document.cookie` nem localStorage para esse identificador. O frontend deve ser servido pela mesma aplicação: adicione seus arquivos em `app/static` e substitua o início provisório. Não há CORS habilitado para origens externas.

O Redis armazena somente IDs em `recentes:<uuid>`. A transação LREM/LPUSH/LTRIM/EXPIRE evita duplicatas, move revisitas ao início e limita a dez itens. O TTL de sete dias é renovado apenas pelo POST; GET não renova o TTL do Redis. GET consulta dados atuais no MongoDB e ignora produtos excluídos. GET de produto não registra histórico. O cookie é anônimo, não uma identidade autenticada; apagar o cookie inicia outro histórico. O estoque só é cadastrado e consultado.

## Dados de demonstração

```powershell
python -m scripts.seed
```

Insere quatro produtos com marcadores internos `demoKey` e índice único esparso. Pode executar novamente: não duplica, não apaga e não sobrescreve edições. Produtos criados manualmente não são alterados.

## Verificação

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
python -m compileall -q app scripts tests
```

Os testes usam **mongomock, fakeredis e transporte HTTP simulado**, injetados somente pela fábrica de aplicação. Verificam login e rejeições, autorização das três escritas, CRUD, precisão do preço, validações, busca, histórico separado, ordenação, duplicatas, limite, renovação de TTL, produtos excluídos, páginas e seed idempotente. Não comprovam conectividade com serviços reais nem o comportamento visual no navegador.

Para validar integrações reais após preencher `.env`:

1. Suba MongoDB/Redis, execute o seed e consulte `/api/produtos` em `/docs`.
2. Entre com senha correta e incorreta no painel. Autorize o Swagger com o token do login e confirme 401 sem token/com token inválido. Para 403, crie uma segunda conta no Supabase fora da lista e use seu token.
3. Crie, edite, consulte e exclua um produto pelo painel. Confira o documento/Decimal128 no MongoDB Compass ou Atlas.
4. Use o POST de recentes com um produto existente e confira GET. Em janela anônima, confirme histórico vazio. Revisite produtos, teste mais de dez e exclua um deles.
5. Com Redis CLI, use `SCAN 0 MATCH recentes:*` e `TTL recentes:<uuid>` para conferir a expiração próxima de 604800 segundos e sua renovação no POST. Nunca use FLUSHDB para esta verificação.
6. Confirme o logout e a limpeza do token no navegador.

Sem credenciais reais não é possível confirmar o login/Supabase, CRUD persistente ou histórico no Redis remoto. O sucesso dos testes locais não substitui esse roteiro.

## Divisão do trabalho

- [x] Backend FastAPI, configuração e serviços reais no runtime.
- [x] Login/logout Supabase e autorização por UUID.
- [x] Painel administrativo com cadastro, edição, exclusão confirmada, filtros e mensagens.
- [x] API pública, histórico Redis, seed e testes de regras.
- [x] Documentação do contrato para continuação no mesmo repositório.
- [ ] Colega: vitrine, detalhes e acabamento visual do cliente.
- [ ] Colega: exibição de recentes e chamada explícita do POST ao abrir detalhes.
- [ ] Colega: carrinho em localStorage e finalização pelo WhatsApp.
- [ ] Dupla: preencher credenciais, validar os três serviços reais e gravar vídeo demonstrativo para entrega em 26/11.

Não estão no escopo pagamento, frete, cadastro de clientes, gestão de pedidos e baixa automática de estoque. Nenhum push, deploy ou publicação é feito pela implementação local.

Referências oficiais: [validação de usuário Supabase](https://supabase.com/docs/reference/javascript/auth-getuser), [limites do logout](https://supabase.com/docs/reference/javascript/auth-signout), [Decimal128 para dinheiro](https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/), [transações redis-py](https://redis.io/docs/latest/develop/clients/redis-py/transpipe/).
