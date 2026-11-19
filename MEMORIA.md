# Memória do projeto para o próximo chat

Diagnóstico de deploy (19/11/2026): usuário publicou em `https://impulso-eza0.onrender.com/`, deseja manter tudo gratuito. Após cadastrar variáveis e redeploy, login real Supabase com conta autorizada funcionou, mas `/api/produtos` e `/api/recentes` seguem 503 (~3 segundos de espera dos bancos). Não continuar supondo variáveis ausentes: Supabase já confirmado aplicado. Criado `/api/admin/diagnostico`, protegido pela autenticação/UUID existentes, para consultar apenas find_one limitado no MongoDB e PING no Redis; retorna categorias de falha sem URI/host/senha/str de exceção. Código em `app/diagnostics.py`, testes de autorização e proteção de dados. Diagnóstico por conexão distingue localhost, autenticação, certificado/TLS, DNS e rede. Requer deploy desta alteração para identificar causa no ambiente do Render. Nenhuma configuração privada foi incluída no repositório; capturas anteriores do usuário exibiam credenciais e foi orientada rotação.

Envio ao GitHub autorizado pelo usuário em 19/11/2026: pacote atual na branch `main` do repositório `icar0x/ecommerce-trabalho`, incluindo vitrine/carrosséis/busca, dashboard/metas, tipografia, atendimento futuro, WebPs/miniaturas, limpeza e logo clara do rodapé. Revisão de credenciais confirmou ausência de valores privados configurados nos arquivos versionados; `.env` permanece fora do Git. A alteração do UUID autorizado é local e não acompanha o envio. `git fetch origin` confirmou base sincronizada antes do commit. Consulte `git log -1` e `git status -sb` para os identificadores e o estado atual do envio; os registros “sem push” abaixo descrevem as etapas anteriores a esta solicitação.

Última alteração (19/11/2026): usuário pediu adequar cores da logo no fundo preto do rodapé. Criada variante clara via Imagegen integrado a partir da logo transparente, com faces das letras branco suave, bordas verde-limão, escudo preto e raio branco. PNG fonte `app/static/assets/impulso-logo-footer.png`, ativo `impulso-logo-footer.webp`, prompt em `.md` homônimo. WebP lossless exportado em 960 px, alpha preservado. `shop.js` seleciona a variante apenas dentro de `#shop-footer`; cabeçalho/admin preservam versões anteriores. Sem filtro monocromático. Script de otimização atualizado para incluir esta variante. Entradas JS versionadas `20261119-footer-logo1`. Edge confirmou imagem correta por cabeçalho/rodapé e layout 1440/390/320 sem overflow; inspecionada captura `.artifacts/logo-rodape-clara-390.png`. node --check/git diff --check aprovados. Esta escolha substitui a preservação das letras pretas especificamente no rodapé; não altera logo original aprovada. Sem push/publicação.

Última revisão (19/11/2026): usuário pediu revisão de código inútil e imagens mais leves. Removidos 82 seletores CSS de componentes antigos (faixa superior, faixa de coleções, serviços, busca inferior, fotos/captions antigos etc.; cerca de 6,5 KB), ícones não usados e duplicação dos valores de cores em JS (CSS mantém as bolinhas). Retirados `scripts/seed.py` e ativos obsoletos hero-sneaker.png/category-training.jpg/impulso-logo.jpg; cópias locais destes três em `.artifacts/retired-assets/`. README usa somente `scripts.catalog`; cobertura de paginação preservada e idempotência do catálogo continua testada. Novo `products-api.mjs` centraliza busca de todas as páginas para catálogo/carrosséis/variantes/dashboard. Carrosséis ocultos não consultam mais todos os produtos; home não busca abas que não mostra. Formulário inferior sem campo virou div; removido feedback de metas nunca preenchido; corrigidos atalhos de estados vazios para `/loja`. Tratamento de falha de imagens não acumula listeners ao alternar cores. Valor potencial do estoque agora calcula centavos em BigInt para suportar limites máximos sem perda.

Imagens: `scripts.optimize_images` (Pillow, dependência só de desenvolvimento) gerou **25 WebPs** e **17 miniaturas de 640 px**, mantendo todos os PNGs ativos como originais/compatibilidade. Imagens principais: 52.767.297 -> 3.104.420 bytes (**94,1% menos**), miniaturas somam 475.560 bytes. `optimized-images.mjs` gerado mapeia URLs PNG e WebP conhecidas; `shop.js` usa srcset/sizes, sem alterar URLs/preços/estoques no MongoDB. Imagens externas/desconhecidas seguem fluxo normal. `scripts/catalog.json` mudou somente as extensões para WebP em novos cadastros; idempotência preservada. Heros/cards/logo/banner HTML usam WebP. Logo transparente lossless e alpha dos recortes verificados. Logo aprovada original `impulso-logo.png` preservada. Entradas CSS/JS versionadas `20261119-optimized1`.

Verificação desta revisão: **32 testes Python e 11 Node aprovados**, compileall/node --check/git diff --check. Script oficial `scripts.check_frontend` atualizado para busca do cabeçalho e executado com MongoDB/Redis reais: busca, favoritos, carrinho, alterações temporárias de estoque/preço, produto removido, histórico/isolamento e limpeza aprovados. Nenhum produto real alterado. QA Edge de otimização: 19 requisições de imagens da home completa (forçando imagens lazy a carregar), **1.165.974 bytes**, somente WebP; PNGs cadastrados continuam HTTP 200, listagem faz uma consulta filtrada, variantes/favoritos mouse+touch e dashboard mantidos sem overflow/erros JS. Capturas `.artifacts/otimizado-*.png`, relatórios `image-optimization.json` e `image-delivery.json`; seletores removidos em `removed-css-selectors.txt`. Scripts adicionais de QA isolado em `.artifacts/check_optimized.py`, `check_admin_dashboard.py`, `check_favorites_pointer.py`. Nenhuma mudança em autenticação/UUID/.env ou publicação/push nesta revisão.

Último ajuste de acesso (19/11/2026): usuário forneceu novo UUID Supabase e pediu substituir o anterior. `ADMIN_USER_IDS` no `.env` foi atualizado para conter SOMENTE o novo ID, validado com `Settings().admins`; não registrar seu valor aqui. Servidor reiniciado para aplicar a lista. Esta operação altera a autorização do painel; não cria/exclui usuários nem altera email/senha no Supabase. Nenhum valor real do `.env` deve ser impresso/versionado. Logs do reinício `.artifacts/server-admin-access-*.log`.

Último ajuste (19/11/2026): usuário pediu melhorar fontes/visibilidade/legibilidade do site. Adotadas fontes locais variáveis Inter (texto/controles) e Manrope (títulos), WOFF2 latino, pesos 400–800, cerca de 73 KB no total, com licenças OFL em `app/static/assets/fonts/`. `brand.css` define @font-face e tokens --font-body/heading; cinza secundário escurecido para #4e5749. Novo `typography.css`, incluído por último nas seis páginas HTML, consolida hierarquia: corpo 16 px, produtos 16 px/preços 18 px, rótulos usuais 14–15 px e metadados 13–14 px; títulos com peso 750/800, menos compressão, mais entrelinha; títulos de seção deixam de ser caixa alta muito pequena. Loja, detalhes, carrinho, atendimento, login e dashboard cobertos. Dashboard em 320 px usa métricas em uma coluna para manter valores legíveis; mix reagrupa quando necessário. CSS/brand/typography versionados `20261119-type1`. QA Edge em 1440/390/320 nas seis páginas (18 combinações) confirmou Inter/Manrope carregadas localmente, ausência de overflow/erros JS e dados do catálogo; autenticação simulada somente no contexto isolado do admin. Inspecionadas capturas `.artifacts/tipografia-search-390.png` e `tipografia-admin-1440.png`; demais `.artifacts/tipografia-*.png`, script `.artifacts/check_typography.py`. Sem mudanças JS/backend nem reexecução das suítes neste ajuste visual. Sem push/publicação.

Última implementação (19/11/2026): painel `/admin` redesenhado como dashboard, a pedido do usuário por gráficos/metas. Menu lateral escuro com logo e links Visão geral/Produtos/Metas; indicadores reais de cadastros (17, incluindo cores), unidades (383), valor potencial a preço de venda (R$ 58.681,70, NÃO faturamento) e estoque baixo. Gráfico de barras de unidades por categoria (75 Roupas, 150 Tênis, 158 Acessórios), rosca do mix de cadastros (3/9/5), progresso de metas de produtos/unidades/completude (foto+descrição), alertas com atalho Revisar. Metas iniciais sugeridas 20 produtos/500 unidades/alerta até 10; editáveis em dialog, persistidas localStorage por UUID autenticado (`impulso_admin_goals_v1:<id>`), com aviso de escopo no UI. Sem dados de vendas inventados nem backend de pedidos. CRUD preservado; cadastro/edição/exclusão atualizam indicadores. Tabela vira cartões no mobile para manter ações visíveis. Arquivos `admin.html`, `admin.js` (agora módulo), `admin-dashboard.css`, `admin-dashboard.js`, `admin-metrics.mjs`; entradas versionadas `20261119-dashboard1`. 30 testes Python e 8 testes JS aprovados (3 novos de métricas/metas). Edge em 1440/1024/768/390/320 confirmou dados reais do catálogo, metas/reload, estoque Revisar, editor, busca, estado de erro e ausência de overflow/erros JS; autenticação simulada SOMENTE no navegador isolado de QA, sem credenciais nem escritas reais de produtos. Capturas `.artifacts/admin-dashboard-*.png`, script `.artifacts/check_admin_dashboard.py`. node --check e git diff --check aprovados. Sem push/publicação. Acesso normal continua exigindo login Supabase.

Última implementação (19/11/2026): botão flutuante para futura IA de atendimento no canto inferior direito da loja, coleções, detalhes e carrinho (compartilhado em `shop.js`). Visual preto/verde-limão, ícone de mensagem, selo IA e texto Atendimento no desktop; versão compacta no mobile. Clique abre painel “Atendimento Impulso”, “Em breve” e aviso de assistente futuro. Não há chat/backend/modelo implementado. Fecha por botão, Escape (retorna foco), clique fora ou foco fora. Respeita safe area e largura/altura do viewport. CSS/JS versionados `20261119-assistant1`. Edge verificou 1440/390/320, abertura/fechamento, Escape/foco, presença em loja/carrinho, sem overflow/erros JS. Capturas `.artifacts/atendimento-*.png`. node --check e git diff --check aprovados. Sem publicação/push.

Último ajuste (19/11/2026): corrigido coração de favoritos inacessível com efeito de mouse. Reproduzido no Edge: `elementFromPoint` sobre coração retornava imagem (card com `transform-style:preserve-3d`). `shop.css` agora usa `transform-style:flat` mantendo inclinação; coração recebe z-index 3. Removido brilho verde radial de `.product-photo::after` e coordenadas `--glow-*` em `product-effects.js`, a pedido do usuário; inclinação, elevação da foto e sombra neutra permanecem. Entradas CSS/JS e import do efeito versionados `20261119-favorite-fix1`. QA Edge com mouse real e sem movimento reduzido, e contexto touch 390, confirmou clique/toque, persistência ao recarregar, remoção na lista de favoritos, ID correto da cor do tênis e favoritos nos carrosséis da home. Sem brilho verde/erros JS. Script `.artifacts/check_favorites_pointer.py`, capturas `.artifacts/favoritos-corrigidos-*.png`. node --check e git diff --check aprovados. Sem push/publicação.

Correção mais recente (19/11/2026): usuário ainda recebia zero resultados; reproduzido termo real `camisa` dos logs (produtos são Camiseta/Regata). `app/search.py` agora inclui equivalências explícitas de vocabulário/singular/plural: camisa/camisas -> camisa/camiseta/regata, camisetas/regatas, sapatos/sneakers -> tênis, garrafa -> garrafa/squeeze e plurais comuns dos acessórios. Acentos/caixa e caracteres especiais literais preservados. `catalog.js` exibe “Resultados para ‘termo’”, breadcrumb “Resultados da busca” e vazio identificando termo. Ver tudo/Ver todos restaura catálogo na própria `/loja`, sem voltar à home. Entradas CSS/JS versionadas `20261119-search-results2`. 30 testes Python aprovados; Edge real em 1440/390 enviou busca pela lupa: camisa=3 cartões, camisas=3, tenis=3 modelos, acessorios=5, garrafa=1; vazio e restauração 11 cartões aprovados, sem overflow/erros JS. Capturas `.artifacts/resultados-camisa-*.png`. Servidor reiniciado (launcher PID 22204, processo efetivo pode ser filho), logs `.artifacts/server-results-*.log`. Sem push/publicação.

Última correção (19/11/2026): busca “tenis” não encontrava “Tênis” por diferença de acento. Usuário pediu LIKE/ILIKE; como catálogo usa MongoDB, implementado equivalente parcial case-insensitive com `$regex`/`i` e equivalência de acentos, sem migração SQL. Novo `app/search.py`, usado por `/api/produtos`: cada palavra deve ocorrer em nome/categoria/descrição, em qualquer ordem; caracteres especiais escapados, incluindo `%` e `_` literais. Não altera produtos/banco. Teste de regressão cobre acentos/caixa, Unicode decomposto, busca parcial/múltiplas palavras, filtros e caracteres especiais. 29 testes Python aprovados. API real: tenis/TÊNIS=9, acessorios=5, roupas=3, tenis branco=5, distr=3. Edge desktop/mobile confirmou envio pela lupa e três cartões de modelos de tênis (variantes preservadas), sem overflow/erros JS. Capturas `.artifacts/busca-sem-acentos-*.png`. Servidor reiniciado com backend atualizado, PID 29608 em 127.0.0.1:8000; logs `.artifacts/server-search-*.log`. README atualizado. Sem push/publicação.

Última alteração (19/11/2026): removida faixa preta do topo (“Seu próximo movimento começa aqui / Escolha. Combine. Supere.”). Lupa do cabeçalho agora é botão que abre formulário no próprio cabeçalho, sem deslocar página/foco para catálogo. Formulário compartilhado em `shop.js` envia GET `/loja?busca=...`, disponível também em detalhes/carrinho. Campo inferior removido de `index.html` e `collection.html`; `catalog.js` usa `#header-search-input`, preserva termo da URL, limpeza e categorias. Fecha por botão Fechar/Escape (retorna foco à lupa) ou clique fora. CSS/JS versionados `20261119-header-search1`. Edge real em 1440/390/320 confirmou abertura sem scroll, foco, envio de resultados, termo preservado, Escape, busca no carrinho, vazio e limpar filtros, sem overflow/erros JS. Capturas `.artifacts/busca-cabecalho-*.png`. node --check e git diff --check aprovados. Sem publicação/push.

Última alteração (19/11/2026): banner final substituído por imagem própria gerada com Imagegen integrado a partir dos assets do District Lime, bolsa grafite e Hydrate. Arquivo `app/static/assets/editorial-impulso-movement.png`, prompt/referências em arquivo `.md` homônimo. Cena escura de produtos sobre plataformas com acentos lima, texto HTML “DO TREINO ÀS RUAS / Seu estilo. Seu impulso.” e botão “Explore a coleção” para `/loja#catalogo`. Removida imagem de academia e texto GO BEYOND desse bloco. Desktop usa texto à esquerda e produtos à direita; mobile usa foto com enquadramento à direita acima do texto, sem sobreposição. Margem antes do rodapé incluída. CSS versionado `20261119-editorial1`. Edge real em 1440/800/390/320 confirmou imagem carregada, disposição responsiva, ausência de overflow/erros JS e link correto. Capturas `.artifacts/banner-final-*.png`. `git diff --check` aprovado. Sem push/publicação.

Último ajuste (19/11/2026): removida da home a seção `.service-strip` com os quatro cards informativos “Encontre seu favorito”, “Seu carrinho, salvo”, “Vistos recentemente” e “Escolha no seu ritmo”, conforme imagem indicada pelo usuário. Carrosséis, cards de coleções e histórico pessoal preservados.

Atualização mais recente (19/11/2026): usuário pediu centralizar cabeçalho mobile, remover faixa “Encontre seu estilo / Everyday / Sneakers / Essentials” e mostrar produtos separados por categoria em carrosséis. Implementado em `index.html`, `catalog.js` e `shop.css`: home padrão exibe Roupas/Tênis/Acessórios (3/3/5 cartões, variantes dos tênis preservadas), rolagem por toque/teclado e botões anterior/próximo, com links para coleção completa. Cards visuais foram movidos abaixo dos carrosséis como destaques editoriais “No seu ritmo”, “Nas ruas”, “Leve com você”, abrindo coleções completas. Favoritos continuam no ícone, com página filtrada; busca e catálogo explícito preservados, ocultando carrosséis nessas visualizações. Cabeçalho mobile tem logo, ações e navegação centralizados em linhas próprias. CSS/entrada versionados `20261119-shelves1`. Edge real verificou 320/390/800/1440 sem overflow, centralização, contagens, rolagem, favoritos, busca e navegação para coleção, sem erros JS. Cinco testes JS, node --check e git diff --check aprovados. Capturas `.artifacts/carrosseis-*.png`, script `.artifacts/check_shelves.py`. Servidor local permanece em 127.0.0.1:8000. Sem push/publicação. Esta decisão substitui home padrão somente favoritos descrita abaixo.

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
