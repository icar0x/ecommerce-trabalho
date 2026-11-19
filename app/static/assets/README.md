# Imagens da vitrine

## Arquivos usados no site

As imagens ativas são servidas em **WebP**. Os PNGs originais da coleção aprovada foram preservados para regeneração e compatibilidade com URLs já cadastradas no MongoDB.

- Heros: `hero-impulso-shoes.webp`, `hero-impulso-hydrate.webp` e `hero-impulso-clothing.webp`.
- Cards editoriais: `category-cutout-clothing.webp`, `category-cutout-shoes.webp` e `category-cutout-accessories.webp`, preservando transparência.
- Banner final: `editorial-impulso-movement.webp`; origem e prompt em `editorial-impulso-movement.md`.
- Logo ativa: `impulso-logo-transparent.webp`, compressão sem perdas. Logo aprovada original `impulso-logo.png` preservada.
- Produtos: 17 WebPs de até 1280 px, com miniaturas `-640.webp` selecionadas pelo navegador via `srcset`/`sizes`.

O carrossel de heros continua com troca a cada 3 segundos, fusão de 850 ms e pausas por foco/aba oculta/fora da tela; enquadramento e textos HTML preservados.

## Regenerar os arquivos otimizados

```powershell
python -m pip install -r requirements-dev.txt
python -m scripts.optimize_images
```

O comando não acessa nem modifica o banco e não apaga os originais. Gera as imagens WebP e `app/static/optimized-images.mjs`, que mapeia URLs PNG e WebP conhecidas para as versões responsivas. Imagens externas e novos arquivos locais sem versão otimizada continuam funcionando normalmente.

Conversão atual: 25 imagens de 52.767.297 para 3.104.420 bytes (94,1% menos); 17 miniaturas somam 475.560 bytes. Qualidade WebP 87, transparência preservada; logo sem perdas. As capas cinematográficas `category-impulso-*.png` permanecem como referências originais dos recortes, sem serem carregadas na loja.

Retirados os arquivos antigos `hero-sneaker.png`, `category-training.jpg` e `impulso-logo.jpg`, que já não participavam do site. Fotos de produtos, preços e estoques mantidos.

## Coleção aprovada

As 17 imagens de camisas, tênis e acessórios foram fornecidas pelo usuário. Nomes, preços e estoques fictícios autorizados estão em `scripts/catalog.json`, agora com endereços WebP. O cadastro continua idempotente e não sobrescreve edições existentes.

Os prompts abaixo documentam a criação dos recortes PNG originais, usados para gerar as versões WebP atuais.

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
