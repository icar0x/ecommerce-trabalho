# Memória do projeto para o próximo chat

Atualizada em 19/11/2026. Este arquivo registra o estado do trabalho; novas instruções do usuário podem alterá-lo.

## LEIA PRIMEIRO — estado atual ao encerrar este chat

Último ajuste: removido link “Loja” do cabeçalho desktop e mobile em `shop.js`, a pedido do usuário. Categorias e demais links preservados. Módulos versionados `20261119-header3`.

CORREÇÃO da última interpretação: usuário NÃO pediu redesenho nem mover a loja inteira. Restaurado layout original da grade (cinco colunas desktop, responsividade anterior, limite 12), removidas regras de três colunas/título grande. SOMENTE links/cards de categorias abrem `/loja?categoria=...`, com a mesma aparência dos produtos anteriores. Loja/Ver todos voltaram ao catálogo na página principal `/?catalogo=1#catalogo`, preservando hero/categorias e demais seções. Página inicial sem filtro continua favoritos. Busca do cabeçalho funciona na principal. QA Edge confirmou os caminhos e grade original, categorias em página separada e mobile sem overflow. Esta correção prevalece sobre a descrição anterior de catálogo completo separado.

Orientação final de navegação: usuário esclareceu que quer MULTIPÁGINA, com lista separada da principal (referência de grade de produtos). Criada rota `/loja` em `app/main.py` e `app/static/collection.html`, com grade de três colunas desktop/duas mobile, categorias, busca e paginação de nove cartões (catálogo atual 9+2). Cards de categoria, heros, navegação Loja e links de explorar agora levam a `/loja?categoria=...`; não carregam mais catálogo inline na home. Home permanece somente favoritos e histórico recente. `catalog.js` é compartilhado, distingue `data-page="collection"`, mantém URL `/loja` nos filtros/páginas e respeita variantes. Backend local reiniciado, logs `.artifacts/server-collection-restarted.*.log`. 28 testes Python aprovados. QA Edge real confirmou navegação separada, ausência de hero/categorias/recentes na listagem, paginação e refresh, favoritos persistidos na home, 1440/390/320 sem overflow/erros JS. Capturas `.artifacts/colecao-pagina-*.png`. Sem push/publicação.

Última orientação de navegação: área principal de produtos da página inicial mostra APENAS favoritos por padrão, com filtros ocultos. Sem favoritos, mostra estado vazio com acesso ao catálogo. Usuário esclareceu que produtos de categoria devem aparecer ao clicar no card específico, carregando no mesmo local. Cards Roupas/Tênis/Acessórios alternam a área para catálogo filtrado inline; Loja/Ver todos usam `/?catalogo=1#catalogo` para catálogo completo. Busca do cabeçalho também abre catálogo. `favoritos=1` continua disponível; filtros limpos preservam modo atual, botão Ver todos sai de favoritos. Recentes Redis preservados. QA Edge confirmou vazio inicial, categoria sem recarregar documento, favoritos/remoção, catálogo completo, busca e mobile sem overflow/erros. Arquivos de entrada versionados `20261119-favoritos-home1`. Sem push/publicação.

Mais recente: usuário pediu substituir “De olho nesses?” por histórico pessoal com Redis. Seção da vitrine agora “Vistos recentemente”, sem chamada promocional, subtítulo “Seus últimos produtos visitados.” Mesmo título nos detalhes. Reaproveitado fluxo Redis existente (cookie anônimo por navegador, IDs únicos em ordem recente, TTL sete dias, até dez no Redis/cinco exibidos). Seção oculta sem visitas; nunca preenche com sugestões. `catalog.js` atualiza recentes em `pageshow` quando navegador restaura página do cache. QA Edge/API/Redis reais confirmou vazio inicial, clique + voltar, revisita sem duplicar, ordem e isolamento de segundo contexto. Teste Python de histórico aprovado; node --check aprovado. Captura `.artifacts/vistos-recentes-pessoal.png`. Sem push/publicação.

Decisão mais recente: usuário voltou a preferir o tema CLARO. Restauradas superfícies suaves #ECEFE8/#F5F6F1/#E4E8DF, textos escuros, banners sem overlay escuro e gestão clara. Tema grafite anterior descartado. Logo transparente preservada nas cores originais, sem filtros; seletores de cores preservados. CSS versionado como `20261119-light2` para atualizar cache.

Correção mais recente da logo: usuário pediu manter as cores normais no tema escuro. Removidos os filtros de logo branca em `brand.css`, inclusive no rodapé. `impulso-logo-transparent.png` permanece ativo com preto/verde-limão/raio branco e fundo transparente. Não aplicar filtro monocromático novamente. Tema escuro preservado.

Última mudança: usuário preferiu site escuro após relatar que a logo não mudou. Tema grafite esverdeado aplicado em `brand.css`, `shop.css` e `style.css`: fundo #121512, superfície #1C211C, textos claros e verde-limão nas ações. Logo transparente com exibição branca por filtro CSS, cabeçalho/rodapé sem moldura branca. Hero com gradiente escuro atrás dos textos; fotos preservadas com mix-blend normal. CSS e módulos de entrada versionados nas URLs (`20261119-dark1`) para invalidar cache anterior. QA Edge confirmou loja/detalhe/carrinho/login em 1440/390/320, sem overflow/erros JS; seletor de cores e adicionar ao carrinho funcionando. Capturas `.artifacts/tema-escuro-*.png`. Sem push ou publicação.

Logo sem fundo: usuário pediu remover o branco para acompanhar o fundo do site. Ativa agora `app/static/assets/impulso-logo-transparent.png`, derivada do PNG aprovado com Imagegen integrado (remoção do fundo, preservando lettering preto/verde e raio branco). Original `impulso-logo.png` preservado. `shop.js` usa o novo arquivo; `brand.css` remove fundo da moldura e exibe logo branca no rodapé preto por filtro CSS. QA Edge confirmou alpha real, moldura transparente e ausência de overflow em 1440/390/320 px. Captura `.artifacts/logo-transparent-header.png`. Esta decisão substitui o caminho ativo anterior; sem push/publicação.

Correção posterior: seletor de cor também incluído na página individual (`product.js`, `.detail-variants` em `shop.css`), acima de Quantidade. Links em bolinhas navegam ao ID real da outra cor, atualizando URL, imagem, descrição, preço, estoque e carrinho pelo fluxo existente. Cor atual marcada com `aria-current`. QA Edge confirmou seletores nas nove páginas, navegação e carrinho com ID selecionado, mobile 390/320 sem overflow e sem erros JS. Cinco testes JS passaram. Captura `.artifacts/detalhe-cores-mobile.png`.

Atualização posterior: usuário pediu agrupar tênis repetidos e trocar cor por bolinhas, conforme componente anexado. Implementado no catálogo com `product-variants.mjs`, `shop.js`, `catalog.js` e `shop.css`: Aero/Base/District têm um cartão cada; seleção atualiza imagem, nome, preço, estoque, links e IDs usados no carrinho/favoritos. Banco e API preservados. Busca/favoritos mostram apenas cores correspondentes ao filtro; paginação agrupa antes de recortar (11 cartões totais/3 tênis). Sem seletor de tamanho ou avaliações. Cinco testes JS aprovados; QA Edge com API real e movimento reduzido confirmou nove opções, imagens/links, carrinho/favoritos por ID, busca Ice e mobile 390/320 sem overflow/erros JS. Capturas `.artifacts/tenis-variantes-*.png`. Sem push/publicação.

O usuário vai abrir **outro chat para continuar este projeto**. O último pedido foi salvar a memória; não pediu criar outro site, publicar, fazer commit ou push. As seções mais antigas abaixo contêm histórico e decisões já substituídas. Este resumo prevalece sobre elas:

- **Identidade ativa:** logo aprovada em `app/static/assets/impulso-logo.png`, preto/branco/verde-limão. Logo e paleta não estão mais adiadas. Não restaurar as versões antigas ou o JPG.
- **Catálogo pronto e persistido:** 17 produtos no MongoDB, com imagens fornecidas pelo usuário: 3 camisas, 9 tênis (3 modelos com 3 cores cada) e 5 acessórios. Preços e estoques fictícios autorizados. `scripts/catalog.json` e `python -m scripts.catalog` permitem cadastrar sem duplicar nem sobrescrever edições. Não executar o seed genérico antigo como parte da retomada.
- **Categorias:** somente Roupas, Tênis e Acessórios. Cards de categorias escuros conforme referência, com texto à esquerda e produtos transparentes à direita. Conjunto das três camisas alinhado mais abaixo, conforme último ajuste. Hover levanta os objetos em 24 px, amplia 7% e acrescenta sombra; texto permanece parado.
- **Cards dos produtos:** inclinação 3D por mouse e brilho verde-limão, em `product-effects.js`, respeitando toque e movimento reduzido. Favoritos e carrinho continuam funcionais.
- **Heros atuais:** três imagens próprias `hero-impulso-shoes.png`, `hero-impulso-hydrate.png`, `hero-impulso-clothing.png`. Troca automática a cada **3 segundos**, sem botões de seleção. **Não pausar por hover**, pois o usuário relatou que o banner não mudava. Pausas por foco de teclado, aba oculta e banner fora da tela permanecem. Gesto horizontal por toque mantido.
- **Última alteração concluída:** transição por fusão de opacidade de **850 ms** entre o hero anterior e o próximo, sem deslocamento lateral nem salto de altura. CSS usa grade sobreposta e conserva altura; slide inativo tem `inert`/`aria-hidden`. Movimento reduzido desativa somente o efeito. Implementação em `hero.js` e `shop.css`; inicialização em `catalog.js`.
- **Verificação:** 28 testes Python e 3 JavaScript passaram na etapa do catálogo. Depois disso, mudanças visuais verificadas pontualmente no Edge com API real; não declarar que toda a suíte foi reexecutada a cada mudança. QA mais recente confirmou fusão real com opacidades intermediárias, altura estável em desktop/mobile, conteúdo inativo sem foco e movimento reduzido sem transição. `node --check` e `git diff --check` passaram. Capturas locais em `.artifacts/`.
- **Estado Git:** último commit continua `7b6ca9f`. Há várias alterações locais e novos assets/scripts ainda sem commit; o trabalho está nos arquivos do projeto. `.vscode/` continua local e não deve ser incluído automaticamente. Nada deste chat foi enviado ao GitHub ou publicado.
- **Servidor:** última instância iniciada neste chat em `http://127.0.0.1:8000/`; pode ou não sobreviver à troca de chat. Verificar antes de iniciar outra. Logs em `.artifacts/server-catalog.*.log`. Não encerrar processos desconhecidos. Atualizar o navegador com Ctrl+F5 para alterações estáticas.
- **Pendências:** seguir a próxima orientação do usuário. WhatsApp segue explicitamente adiado; número ainda indefinido. Entrega/vídeo e envio das alterações ao GitHub continuam pendentes. Não implementar pagamento, frete, cadastro de clientes, pedidos ou baixa de estoque sem novo pedido.
- **Segredos:** nunca imprimir nem versionar valores reais do `.env`. Assets finais já estão no projeto; não dependem dos arquivos originais em Downloads.

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

## Atualizacao da identidade em 19/11/2026

- O usuario definiu a nova logo anexada no chat (raio entre L e O) e descartou a antiga. Esta decisao substitui o adiamento registrado acima. Nao usar a imagem antiga em .artifacts.
- Paleta preto/branco/verde-limao aplicada em shop.css e style.css; tokens em brand.css.
- O anexo ainda nao esta disponivel como arquivo local. Falta salvar a nova imagem em app/static/assets/impulso-logo.jpg. shop.js carrega esse caminho quando disponivel e preserva o nome textual como alternativa. Nao afirmar que a logo ja foi inserida.
- Verificado no Edge: vitrine em 1440 e 390 px, carrinho/login em 390 px sem overflow horizontal. APIs de catalogo simuladas nesse teste visual, sem escrita nos bancos. node --check shop.js e git diff --check aprovados.

## Logo instalada em 19/11/2026

- Arquivo exato fornecido pelo usuario copiado de Downloads para `app/static/assets/impulso-logo.jpg`. Pendencia anterior resolvida.
- Logo ativa no cabecalho e rodape da vitrine, detalhes e carrinho. CSS enquadra as margens brancas sem alterar o arquivo original.
- Edge confirmou carregamento real da imagem (1600 px) no cabecalho/rodape em 1440, 390 e 320 px, sem overflow; logo tambem confirmada no carrinho. APIs simuladas no teste visual.

## Coleção cadastrada e logo substituída — 19/11/2026

- Usuário aprovou a mistura esportivo/streetwear, forneceu 17 imagens e autorizou preços/estoques fictícios. Coleção efetivamente inserida no MongoDB: 3 camisas, 9 tênis (3 modelos em 3 cores, produtos separados) e 5 acessórios. Nenhum produto anterior foi apagado.
- `scripts/catalog.json`: nomes, descrições, arquivos, preços e estoques iniciais. `python -m scripts.catalog` insere sem duplicar ou sobrescrever edições do painel, com índice único esparso `catalogKey`. Seed antigo de quatro exemplos continua separado e opcional.
- Camisas R$ 79,90–99,90; tênis R$ 249,90–299,90; acessórios R$ 29,90–159,90. Estoque por produto entre 12 e 50. Sem tamanho/numeração ou seletor de cor; cada cor é um cadastro separado.
- API passou a aceitar imagens locais restritas a `/static/assets/arquivo.ext`, incluindo espaços/acentos codificados. URLs externas HTTP/HTTPS continuam aceitas. Painel permite editar caminhos locais; frontend resolve imagens na origem atual.
- **Logo atual é `app/static/assets/impulso-logo.png`**, copiada da nova imagem PNG enviada pelo usuário. Substitui o JPG anterior; não restaurar imagens antigas. Preto/branco/verde-limão mantidos. Últimas decisões prevalecem sobre os registros históricos acima.
- Validação: 28 testes Python e 3 JavaScript aprovados. QA no Edge com API/MongoDB reais confirmou as 17 imagens, paginação 12+5, filtros 3/9/5, detalhe Motion com nome acentuado no arquivo, duas unidades no carrinho por R$ 179,80, nova logo PNG e mobile sem overflow ou erros JavaScript. Navegador isolado, sem alteração do carrinho do usuário. Histórico anônimo de QA pode expirar normalmente no Redis.
- Servidor deste projeto reiniciado para carregar a nova validação de imagens, disponível em `http://127.0.0.1:8000/`. Logs locais em `.artifacts/server-catalog.*.log`. Não encerrar processos desconhecidos.
- Nada foi enviado ao GitHub ou publicado. WhatsApp permanece adiado.

## Animação dos cards — 19/11/2026

- Usuário pediu o efeito do ProductHighlightCard React colado no anexo. Adaptado para a stack atual sem introduzir React, Tailwind ou Framer Motion.
- `app/static/product-effects.js` integrado à fábrica `productCard` em `shop.js`: inclinação 3D de até 6 graus por eixo, brilho verde-limão seguindo cursor, imagem levemente elevada e retorno neutro por mola. Aplica também a favoritos e recentes.
- Ativo apenas com mouse/hover e sem `prefers-reduced-motion: reduce`. Sem animação por toque. Botões e links preservados; foco de teclado destacado.
- QA no Edge confirmou inclinação nos dois eixos, brilho, retorno neutro, favorito, adicionar ao carrinho, foco de teclado, movimento reduzido e toque em 390 px sem overflow. Navegador isolado, sem alterar carrinho pessoal. Sem exceções JS; `node --check` aprovado nos scripts modificados. Captura `.artifacts/card-animado.png`.

## Capas das categorias — 19/11/2026

- Usuário forneceu três imagens cinematográficas prontas, aplicadas às categorias em `index.html`: `category-impulso-clothing.png` (três camisas), `category-impulso-shoes.png` (District Lime branco/cinza), `category-impulso-accessories.png` (mochila, boné e squeeze).
- Originais copiados sem edição para `app/static/assets/`. CSS usa proporção 3:2, contain e cores originais, sem zoom no hover, preservando todos os produtos na composição em desktop/mobile. Substituem as fotos genéricas nessas capas.
- Edge verificou carregamento das três imagens, proporção e ausência de cortes/dessaturação em 1440/390 px, sem overflow; clique em Roupas filtra os três produtos. Capturas `.artifacts/categorias-impulso-*.png`.

## Formato atual dos cards de categorias — 19/11/2026

- Nova referência do usuário: card escuro com textura de grade, categoria/descrição à esquerda e objeto recortado à direita; objeto deve subir no hover. Esta versão substitui as capas retangulares anteriores na página inicial.
- `index.html` usa `.category-highlight`, `.category-copy` e `.category-object`. Três camisas continuam juntas; tênis District Lime branco/cinza; acessórios com mochila, boné e squeeze.
- Recortes transparentes `category-cutout-clothing.png`, `category-cutout-shoes.png`, `category-cutout-accessories.png` preparados com Imagegen integrado a partir das capas originais, preservadas. Prompts e origem registrados em `app/static/assets/README.md`.
- CSS mantém três cards em linha no desktop e uma coluna em telas até 800 px. Hover no objeto: sobe 24 px, aumenta 7%, recebe sombra; tênis também inclina suavemente. Texto fica parado. Teclado recebe realce/elevacão equivalentes. Sem elevação por toque ou movimento reduzido.
- QA no Edge confirmou carregamento e ausência de overflow em 1440/1024/768/390/320 px; três objetos sobem e retornam sem mover texto; teclado filtra 3 Roupas; toque filtra 9 Tênis; movimento reduzido não eleva; sem erros JS. Captura `.artifacts/categorias-highlight-final.png`. QA opcional `check_frontend.py` adaptado para identificar categorias por `data-category`.

- Ajuste posterior: conjunto das camisas rebaixado para alinhar a base com os acessórios em todos os breakpoints (40/95/28/85 px). Verificado em 1440/1024/768/390 px sem overflow. Mantido hover de elevação.

## Heros próprios — 19/11/2026

- Usuário forneceu três panoramas prontos: tênis District Lime com partículas, Hydrate com água e três camisas. Copiados sem edição para `app/static/assets/hero-impulso-shoes.png`, `hero-impulso-hydrate.png`, `hero-impulso-clothing.png`.
- Hero da página inicial virou carrossel manual, começando pelo tênis. Seletores Tênis/Hydrate/Roupas, teclas esquerda/direita/Home/End e gesto horizontal por toque. Sem avanço automático. Código isolado em `app/static/hero.js`, inicializado por `catalog.js`.
- Títulos e botões adaptados a cada campanha, links para a categoria correspondente e link Ver categorias. Texto em HTML; fotos preservadas. Um slide visível por vez, controles `aria-pressed`, anúncios discretos e slides inativos ocultos para teclado/leitores.
- Em telas até 700 px, foto e texto ficam em blocos separados; foto enquadra os produtos à direita do panorama, evitando texto sobre o produto. Demais layouts preservados.
- QA Edge com API real: três imagens carregam, um slide ativo, sem overflow em 1440/1024/768/390/320 px; teclado circular, toque e links confirmados (Roupas=3 e Acessórios=5). Sem erros JavaScript. `node --check` aprovado em hero.js/catalog.js. Capturas `.artifacts/hero-*.png`.

## Heros automáticos — última orientação de 19/11/2026

- Usuário pediu troca automática e remoção dos botões de seleção. Seletores Tênis/Hydrate/Roupas retirados do HTML e CSS, junto do espaço antes reservado para eles. Botões de explorar categorias permanecem.
- `hero.js` alterna tênis → Hydrate → roupas → tênis a cada seis segundos. Pausa com mouse sobre o banner, foco de teclado, aba oculta ou banner fora da tela; retoma com intervalo completo. Gesto horizontal no toque mantido. Transição suave desativada com movimento reduzido; sem anúncios repetidos de troca automática ao leitor de tela.

- Ajuste mais recente: usuário relatou que os heros não trocavam e pediu intervalo menor. Removida a pausa por hover (mouse sobre o banner) e reduzido o intervalo para **3 segundos**. Pausas por foco de teclado, aba oculta e banner fora da tela mantidas. Edge confirmou ciclo completo com mouse sobre o hero, um slide por vez e sem seletores.

- Transição refinada a pedido do usuário: fusão de opacidade de **850 ms** entre slide anterior e próximo, mantendo intervalo de 3 s. Grade sobrepõe as campanhas e reserva altura estável; slide anterior termina de desaparecer antes de ficar invisível. Slides inativos usam `inert` e `aria-hidden` para impedir foco/anúncios durante a saída. Movimento reduzido troca sem efeito. Removida a antiga animação de entrada isolada.


## Superf?cies mais suaves ? 19/11/2026

- A pedido do usu?rio, branco intenso das superf?cies substitu?do por cinza claro com fundo esverdeado: fundo `#ECEFE8`, superf?cies `#F5F6F1`, ?reas de fotos `#E4E8DF` e divis?rias `#D5DBCF`. Tokens centralizados em `brand.css`, usados por `shop.css` e `style.css`. Preto e verde-lim?o preservados. Logo e imagens originais preservadas.
- Aplicado ? loja, detalhes, carrinho e administra??o/login. QA Edge em 1440/390 px confirmou fundo computado e aus?ncia de overflow na vitrine, carrinho e login; capturas `.artifacts/paleta-suave-*.png`. `git diff --check` passou. Altera??o local, sem publica??o ou push.
