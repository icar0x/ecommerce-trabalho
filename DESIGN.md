# Interface da loja

Referência: imagem de e-commerce de calçados fornecida pelo usuário. A adaptação preserva o nome configurável da loja e a navegação e os dados reais do projeto.

Catálogo restrito a **Roupas, Tênis e Acessórios**. Essas três categorias aparecem na navegação, nos cartões visuais, nos filtros e nas opções do painel. A API recusa cadastros/edições sem categoria ou com outro valor; a lista pública permanece disponível mesmo sem produtos.

## Sistema visual

- Tipografia: Arial/Helvetica; títulos com espaçamento reduzido, textos de interface a partir de 14 px e metadados secundários a partir de 12 px.
- Paleta provisória da loja: preto `#111111`, branco `#ffffff`, superfícies cinza e acento discreto dourado `#b69a63`, conforme a referência de layout.
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
