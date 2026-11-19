"""python -m scripts.optimize_images: gera WebP e miniaturas sem alterar originais/banco."""

import json
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'app/static/assets'
EXTRAS = [
    'hero-impulso-shoes.png', 'hero-impulso-hydrate.png', 'hero-impulso-clothing.png',
    'category-cutout-shoes.png', 'category-cutout-clothing.png', 'category-cutout-accessories.png',
    'editorial-impulso-movement.png', 'impulso-logo-transparent.png', 'impulso-logo-footer.png',
]


def url(path):
    return '/static/assets/' + quote(path.name)


def convert(source, target, limit, lossless=False):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=87, method=6, lossless=lossless, exact=True)
        return image.width


def optimize():
    catalog = json.loads((ROOT / 'scripts/catalog.json').read_text(encoding='utf-8'))
    products = {unquote(item['imagemUrl'].rsplit('/', 1)[-1]) for item in catalog}
    products = {str(Path(name).with_suffix('.png')) for name in products}
    manifest = []
    report = []
    for name in sorted(products | set(EXTRAS)):
        source = ASSETS / name
        target = source.with_suffix('.webp')
        limit = 1920 if name.startswith('hero-') or name.startswith('editorial-') else 1280
        logo = name in {'impulso-logo-transparent.png', 'impulso-logo-footer.png'}
        logo_limit = 960 if name == 'impulso-logo-footer.png' else 4096
        width = convert(source, target, logo_limit if logo else limit, lossless=logo)
        entry = {'original': url(source), 'src': url(target), 'width': width}
        record = {'source': name, 'sourceBytes': source.stat().st_size, 'webpBytes': target.stat().st_size}
        if name in products:
            thumbnail = source.with_name(source.stem + '-640.webp')
            entry['thumbnailWidth'] = convert(source, thumbnail, 640)
            entry['thumbnail'] = url(thumbnail)
            record['thumbnailBytes'] = thumbnail.stat().st_size
            manifest.append(entry)
        report.append(record)
    module = '// Gerado por python -m scripts.optimize_images; compatível com URLs PNG já cadastradas.\n'
    module += 'const variants = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n'
    module += 'export const optimizedImages = Object.fromEntries(variants.flatMap(({original, ...image}) => [[original, image], [image.src, image]]));\n'
    (ROOT / 'app/static/optimized-images.mjs').write_text(module, encoding='utf-8')
    artifacts = ROOT / '.artifacts'
    artifacts.mkdir(exist_ok=True)
    (artifacts / 'image-optimization.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    before = sum(item['sourceBytes'] for item in report)
    after = sum(item['webpBytes'] for item in report)
    thumbs = sum(item.get('thumbnailBytes', 0) for item in report)
    print(f'{len(report)} imagens: {before:,} -> {after:,} bytes ({(1-after/before)*100:.1f}% menores).')
    print(f'{len(manifest)} miniaturas: {thumbs:,} bytes no total. Originais preservados.')


if __name__ == '__main__':
    optimize()
