# Imagens da vitrine

## Heros atuais da loja

Três imagens fornecidas pelo usuário em 19/11/2026, copiadas sem edição para o projeto:

- `hero-impulso-shoes.png`: District Lime branco/cinza em cenário grafite com partículas de impacto.
- `hero-impulso-hydrate.png`: garrafa Hydrate com gotas e splash de água.
- `hero-impulso-clothing.png`: Essential, Motion e Pulse suspensas em estúdio.

Substituem o banner genérico `hero-sneaker.png` na página inicial. O carrossel alterna automaticamente a cada 3 segundos, sem seletores visíveis, com gesto horizontal de toque disponível. Pausa somente com foco de teclado, aba oculta ou banner fora da tela. Continua alternando com o mouse sobre o banner. A transição suave respeita movimento reduzido. Texto e botões das campanhas são HTML, sem alterar as imagens. No celular a área da imagem enquadra a metade direita do panorama e o texto ocupa um bloco separado, preservando a leitura e os produtos. As imagens dos heros não alteram as imagens de cada produto no catálogo.

O banner é editorial/ilustrativo; não representa um produto cadastrado ou uma parceria com marcas.

## Banner gerado

- Arquivo: `hero-sneaker.png`.
- Produzido com a ferramenta integrada `image_gen` e salvo neste projeto; não utiliza chave de API do usuário.
- Prompt final:

> Create a photorealistic premium sportswear ecommerce hero background image, landscape 2.4:1 aspect ratio. A single beautiful black and white leather high-top basketball sneaker, completely unbranded with no logos or lettering, viewed from the lateral side in a dynamic diagonal pose with the toe pointing down-left and ankle rising up-right, occupying the RIGHT 52 percent of the composition. The sneaker rests just above a rough jet-black basalt rock ledge in the bottom-right corner. Soft pale neutral grey studio background with subtle shadows, smooth gradient to almost white on the LEFT 45 percent. Keep the left 45 percent completely empty for separately rendered black web headline and buttons. Detailed leather stitching, textured outsole, realistic product studio photography, cinematic natural softbox light, monochrome palette. No text, no watermarks, no collage, no graphical UI elements, no price or sale graphics.

## Fotografias de categorias e banner editorial

Cópias locais das fotografias servidas por Unsplash Images. A loja não faz requisições ao Unsplash durante a navegação.

| Arquivo | Origem |
| --- | --- |
| `category-shoes.jpg` | https://images.unsplash.com/photo-1542291026-7eec264c27ff |
| `category-clothing.jpg` | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab |
| `category-training.jpg` | https://images.unsplash.com/photo-1517836357463-d25dfeac3438 |
| `category-accessories.jpg` | https://images.unsplash.com/photo-1553062407-98eeb64c6a62 |

As fotos de roupas, tênis e acessórios ilustram a navegação por categoria; `category-training.jpg` aparece somente no banner editorial. Os produtos da vitrine continuam vindo exclusivamente do MongoDB, com suas próprias imagens cadastradas.

## Logo Impulso

`impulso-logo.png`: versão mais recente fornecida pelo usuário em 19/11/2026, com raio entre L e O. Original copiado sem alterações; enquadramento das margens brancas feito em `brand.css`. Substitui a versão JPG anterior, que não está mais em uso.

## Produtos Impulso

As 17 imagens PNG de camisas, tênis e acessórios foram fornecidas pelo usuário para a coleção esportiva/streetwear. O mapeamento entre arquivos, nomes, preços e estoques fictícios está em `scripts/catalog.json`. Os arquivos originais são preservados; espaços e acentos são codificados nos endereços usados pelo catálogo.

## Capas atuais de categorias

Imagens cinematográficas fornecidas pelo usuário em 19/11/2026, copiadas sem edição:

- `category-impulso-clothing.png`: três camisas Impulso juntas.
- `category-impulso-shoes.png`: District Lime branco/cinza em estúdio urbano.
- `category-impulso-accessories.png`: mochila Transit, boné Core e squeeze Hydrate.

Substituem as fotografias genéricas das três categorias na página inicial. As imagens JPG antigas não são mais usadas nessas capas; `category-training.jpg` continua no banner editorial. Enquadramento 3:2 com `object-fit: contain`, sem dessaturação ou zoom, para manter os produtos inteiros inclusive no celular.

## Produtos recortados para os cards escuros (versão atual)

O usuário pediu o formato da referência com texto à esquerda e produto à direita que sobe ao receber hover. A versão atual usa os arquivos abaixo, derivados das capas fornecidas pelo usuário com a ferramenta integrada Imagegen em modo de edição e fundo transparente. Os originais cinematográficos acima foram preservados. Não houve uso de API/CLI ou chave do usuário.

- `category-cutout-clothing.png`: três camisas juntas, fundo transparente.
- `category-cutout-shoes.png`: District Lime branco/cinza, fundo transparente.
- `category-cutout-accessories.png`: mochila, boné e squeeze, fundo transparente com luz residual suave ao redor do conjunto.

Prefixo comum dos prompts finais: `Use case: background-extraction. Asset: website category card foreground.`

Prompt Roupas:
> Remove only the background and floor from the provided image, preserving all THREE shirts, their exact designs, colors, logos and positions relative to one another. Keep the three garments fully visible. Output a tightly framed cutout of the group on genuine transparent background, no backdrop, no ground, no shadow outside the objects. Do not redesign or add text.

Prompt Tênis:
> Remove only the background, platform and floor from the provided image, preserving the SINGLE District Lime white/gray sneaker, its exact design, laces, sole, lime accents and logos. Keep the entire sneaker visible. Output a tightly framed cutout on genuine transparent background, no backdrop, no ground, no shadow outside the object. Do not redesign or add text.

Prompt Acessórios:
> Remove only the background, concrete platforms and floor from the provided image, preserving the backpack, cap and bottle, their exact designs, colors and logos and arrangement. Keep all THREE objects fully visible. Output a tightly framed cutout of the group on genuine transparent background, no backdrop, no ground, no shadow outside the objects. Do not redesign or add text.
