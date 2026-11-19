# Interface da loja

Correção de escopo: manter design original da loja e da grade (cinco colunas desktop). Apenas clicar numa categoria abre listagem separada em `/loja?categoria=...`; Loja/Ver todos exibem catálogo na principal, com composição anterior. Removidos layout de três colunas e título ampliado introduzidos na etapa anterior. Home padrão permanece favoritos.

Navegação mais recente: catálogo agora em página separada `/loja` (`collection.html`), substituindo carregamento inline. Cards e links das categorias abrem `/loja?categoria=...`. Grade de três colunas no desktop, duas no celular, nove cartões por página; busca/filtros/paginação mantêm a rota. Home exibe favoritos e recentes; listagem não contém hero ou faixas promocionais da home.

Página inicial: área principal começa com “Seus favoritos”, sem produtos gerais ou filtros. Clicar em um card de categoria carrega os produtos dessa categoria no mesmo espaço, sem recarregar a página. Loja e Ver todos abrem catálogo completo (`catalogo=1`). Favoritos e histórico recente continuam separados.

Histórico pessoal: seção “De olho nesses?” substituída por “Vistos recentemente”, sem chamada promocional. Mostra apenas produtos abertos pelo próprio visitante, a partir do histórico Redis vinculado ao cookie daquele navegador; oculta quando vazia ou indisponível. Mesma nomenclatura na página de detalhes. Voltar à loja pelo histórico do navegador também atualiza a seção.

Decisão final de tema: usuário pediu voltar ao claro suave (fundo #ECEFE8, superfícies #F5F6F1 e áreas secundárias #E4E8DF). Tema escuro substituído. Logo permanece transparente nas cores originais e seletores de cor mantidos.

Última orientação da logo: preservar as cores originais preto/verde-limão/raio branco no tema escuro; removidos todos os filtros monocromáticos do cabeçalho/rodapé. Fundo transparente mantido. Esta orientação substitui a exibição branca descrita abaixo.

Tema atual: grafite esverdeado `#121512`, superfícies `#1C211C`, áreas secundárias `#272E27`, divisórias `#394239`, texto `#F1F4ED` e metadados `#B3BDAE`. Verde-limão preservado nas ações. Esta decisão substitui o tema claro anterior. Logo transparente exibida em branco por CSS nos fundos escuros; imagens originais de produtos preservadas, sem multiplicação sobre fundo escuro. Hero recebe gradiente escuro atrás do texto no desktop e bloco escuro separado no mobile. Loja, detalhes, carrinho e gestão usam a mesma paleta. Arquivos CSS/módulos de entrada usam versão na URL para atualizar cache.

Atualização de 19/11/2026: a vitrine agrupa as cores dos tênis Aero, Base e District em um cartão por modelo, com bolinhas acessíveis para selecionar a variação. Foto, nome, preço, estoque, links, carrinho e favorito acompanham o produto selecionado. A contagem/paginação ocorre depois do agrupamento (11 cartões totais, 3 de tênis). Busca e favoritos agrupam somente as variações que correspondem ao filtro. Produtos desconhecidos continuam separados. Implementação em HTML/JS/CSS, adaptando a referência React sem migração de stack, tamanhos ou avaliações fictícias. Os nove cadastros/estoques continuam independentes no banco.

Referência: imagem de e-commerce de calçados fornecida pelo usuário. A adaptação preserva o nome configurável da loja e a navegação e os dados reais do projeto.

Catálogo restrito a **Roupas, Tênis e Acessórios**. Essas três categorias aparecem na navegação, nos cartões visuais, nos filtros e nas opções do painel. A API recusa cadastros/edições sem categoria ou com outro valor; a lista pública permanece disponível mesmo sem produtos.

## Sistema visual

- Tipografia: Arial/Helvetica; títulos com espaçamento reduzido, textos de interface a partir de 14 px e metadados secundários a partir de 12 px.
- Paleta provisória da loja: preto `#111111`, branco `#ffffff`, superfícies cinza e acento verde-limao `#b7ff00`, conforme a referência de layout.
- Nome textual provisório no cabeçalho e rodapé. A logo e a paleta baseada nela foram retiradas desta versão a pedido do usuário e serão definidas novamente.
- Conteúdo limitado a 1280 px; espaçamento por múltiplos de 4/8 px.
- Botões retangulares com raio de 6 px; cartões e imagens com raio de 8–10 px.
- Foco visível, link para pular conteúdo, rótulos acessíveis e redução de movimento conforme preferência do sistema.

## Composição e UX

Faixa preta de apresentação, cabeçalho branco com navegação e ícones, banner com fotografia e duas ações, navegação por atividade, categorias fotográficas, catálogo com busca/filtros, conteúdo editorial, blocos de serviço e rodapé em colunas.

A vitrine usa cinco colunas em telas largas, quatro/três em telas intermediárias e duas no celular. Categorias e navegação têm rolagem horizontal própria em telas pequenas, sem deslocar a página inteira. O mesmo conjunto de tokens é aplicado a detalhes e carrinho.

Favoritos são guardados no navegador em `impulso_favorites_v1`, limitados a 50 IDs. Os corações mudam de estado e `Meus favoritos` exibe os produtos atuais, com busca e categorias. Produtos removidos não aparecem nessa listagem. Não há conta de cliente ou sincronização entre dispositivos.

Não foram reproduzidas avaliações, descontos, políticas de entrega, marcas parceiras ou formulários de newsletter sem suporte real no projeto. O WhatsApp continua adiado.

Arquivos: `app/static/shop.css` (tokens/componentes), `shop.js` (componentes compartilhados), `catalog.js` (vitrine/favoritos), `index.html` (estrutura) e `assets/` (imagens locais). Origem dos assets e prompt do banner em `app/static/assets/README.md`.

Atualizacao de 19/11: nova logo aprovada pelo usuario, com raio entre L e O. A antiga foi descartada. Paleta aplicada; insercao da imagem aguarda o arquivo local em `app/static/assets/impulso-logo.jpg`. Esta decisao substitui o adiamento acima.

Logo instalada: `app/static/assets/impulso-logo.jpg`, imagem original enviada pelo usuario. Cabecalho e rodape usam a imagem com enquadramento por CSS, preservando preto/branco/verde-limao. Pendencia do arquivo resolvida.

Atualização mais recente: a logo foi substituída por `app/static/assets/impulso-logo.png`, novo arquivo enviado pelo usuário. A versão JPG anterior não é usada. Coleção esportiva/streetwear cadastrada com 17 produtos e imagens próprias fornecidas pelo usuário; preços e estoques fictícios autorizados. Cada variação de cor dos tênis aparece como um produto separado.

## Animação dos cards

Referência: componente React ProductHighlightCard enviado pelo usuário, adaptado ao HTML/CSS/JavaScript existente em `product-effects.js` e `shop.css`. Cards do catálogo, favoritos e recentes inclinam até 6 graus por eixo, com retorno por mola ao sair. Brilho verde-limão acompanha o cursor e a imagem se eleva discretamente dentro da área da foto. Dimensões e controles são preservados. O efeito atua apenas com mouse em dispositivo com hover e sem preferência por movimento reduzido; no toque não interfere na rolagem. Foco de teclado recebe contorno visível.

Capas atuais de categorias: composições cinematográficas fornecidas pelo usuário com os próprios produtos — três camisas em Roupas, District Lime branco/cinza em Tênis e mochila/boné/squeeze em Acessórios. Imagens em 3:2, sem cortes, dessaturação ou zoom no hover, inclusive no celular. Arquivos `category-impulso-*.png`.

Última revisão: os cards das categorias agora seguem a referência escura enviada pelo usuário, com moldura arredondada, superfície grafite e grade discreta. Nome, descrição e link ficam à esquerda; recortes `category-cutout-*.png` ficam à direita. Ao passar o mouse no objeto, apenas ele sobe 24 px, aumenta 7% e ganha sombra. Tênis também inclina. Três cards em linha no desktop; uma coluna até 800 px. Movimento reduzido e toque preservam a apresentação estática; foco visível permite navegar pelo teclado. As composições cinematográficas anteriores permanecem como fontes dos recortes, sem uso direto nos cards atuais.

## Heros próprios

Três campanhas panorâmicas fornecidas pelo usuário: District Lime, Hydrate com água e as três camisas. Carrossel manual com seletores Tênis/Hydrate/Roupas, navegação por teclado e gesto horizontal no toque, sem avanço automático. Texto preto à esquerda no desktop; produtos à direita. Em telas até 700 px, fotografia e conteúdo aparecem em blocos separados, com enquadramento da região dos produtos. Cada campanha oferece botão para sua categoria e acesso às categorias visuais. Textos são HTML e as imagens originais permanecem intactas. Arquivos `hero-impulso-*.png`, lógica em `hero.js`.

Alteração solicitada depois: heros agora alternam automaticamente a cada seis segundos, sem seletores visíveis. Pausa durante hover/foco, quando a aba está oculta ou o banner fora da tela. Transição suave somente sem preferência por movimento reduzido. Gesto de toque mantido; espaço dos seletores removido.

Último ajuste: intervalo reduzido para **3 segundos**, com continuidade mesmo sob o mouse. Pausa por hover retirada após relato do usuário de que o banner não mudava. Foco de teclado, aba oculta e banner fora da tela ainda pausam.

Transição atual: fusão de opacidade de 850 ms entre as campanhas, sobrepostas em uma grade de altura estável. O slide anterior desaparece gradualmente enquanto o novo aparece; sem deslocamento lateral ou salto de altura. Conteúdo inativo fica inerte e oculto para leitores de tela. Movimento reduzido desativa a transição, preservando a troca automática.


## Superf?cies mais suaves ? 19/11/2026

- A pedido do usu?rio, branco intenso das superf?cies substitu?do por cinza claro com fundo esverdeado: fundo `#ECEFE8`, superf?cies `#F5F6F1`, ?reas de fotos `#E4E8DF` e divis?rias `#D5DBCF`. Tokens centralizados em `brand.css`, usados por `shop.css` e `style.css`. Preto e verde-lim?o preservados. Logo e imagens originais preservadas.
- Aplicado ? loja, detalhes, carrinho e administra??o/login. QA Edge em 1440/390 px confirmou fundo computado e aus?ncia de overflow na vitrine, carrinho e login; capturas `.artifacts/paleta-suave-*.png`. `git diff --check` passou. Altera??o local, sem publica??o ou push.
