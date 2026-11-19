from pathlib import Path

from PIL import Image, ImageChops

ASSETS = Path(__file__).resolve().parents[1] / 'app/static/assets'


def test_webp_logo_preserves_pixels_and_transparency():
    with Image.open(ASSETS / 'impulso-logo-transparent.png') as source, Image.open(ASSETS / 'impulso-logo-transparent.webp') as optimized:
        assert source.size == optimized.size
        assert optimized.mode == 'RGBA'
        assert all(channel.getextrema() == (0, 0) for channel in ImageChops.difference(source, optimized).split())


def test_transparent_category_images_keep_alpha_and_reduce_size():
    for category in ['clothing', 'shoes', 'accessories']:
        original = ASSETS / f'category-cutout-{category}.png'
        optimized = original.with_suffix('.webp')
        with Image.open(optimized) as image:
            assert image.mode == 'RGBA'
            assert image.getchannel('A').getextrema() == (0, 255)
        assert optimized.stat().st_size < original.stat().st_size * .4
