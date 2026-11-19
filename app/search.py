"""Busca parcial literal sem distinguir caixa e acentos, sem alterar os dados."""

import re
import unicodedata


ACCENTS = {
    'a': 'aàáâãäå',
    'e': 'eèéêë',
    'i': 'iìíîï',
    'o': 'oòóôõö',
    'u': 'uùúûü',
    'c': 'cç',
    'n': 'nñ',
    'y': 'yýÿ',
}

ALIASES = {
    'camisa': ('camisa', 'camiseta', 'regata'),
    'camisas': ('camisa', 'camiseta', 'regata'),
    'camisetas': ('camiseta',),
    'regatas': ('regata',),
    'roupa': ('roupas',),
    'sapato': ('tenis',),
    'sapatos': ('tenis',),
    'sneaker': ('tenis',),
    'sneakers': ('tenis',),
    'acessorio': ('acessorios',),
    'bones': ('bone',),
    'bolsas': ('bolsa',),
    'mochilas': ('mochila',),
    'garrafa': ('garrafa', 'squeeze'),
    'garrafas': ('garrafa', 'squeeze'),
    'squeezes': ('squeeze',),
}


def literal_pattern(word):
    return ''.join(
        (f'[{ACCENTS[char]}]' if char in ACCENTS else re.escape(char))
        + ('[\u0300-\u036f]*' if char.isalpha() else '')
        for char in word
    )


def search_query(text):
    # Equivalente a ILIKE '%termo%', com equivalência de acentos adicional.
    # Regex recebe somente caracteres escapados ou classes constantes locais.
    folded = ''.join(char for char in unicodedata.normalize('NFD', text.casefold())
                     if not unicodedata.combining(char))
    clauses = []
    for word in folded.split():
        pattern = '(?:' + '|'.join(literal_pattern(term) for term in ALIASES.get(word, (word,))) + ')'
        clauses.append({'$or': [
            {field: {'$regex': pattern, '$options': 'i'}}
            for field in ('nome', 'categoria', 'descricao')
        ]})
    return {'$and': clauses} if clauses else {}
