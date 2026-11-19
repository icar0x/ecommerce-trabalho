"""Conexão MongoDB com certificados portáveis para execução local e na nuvem."""

from urllib.parse import parse_qs, urlsplit

import certifi
from pymongo import MongoClient


def create_mongo_client(uri, serverSelectionTimeoutMS=5000, **options):
    parsed = urlsplit(uri)
    query = {key.lower(): values[-1] for key, values in parse_qs(parsed.query).items()}
    tls_flag = query.get('tls', query.get('ssl'))
    tls_enabled = tls_flag.lower() in {'true', '1'} if tls_flag is not None else parsed.scheme == 'mongodb+srv'
    if tls_enabled and 'tlscafile' not in query and 'tlsCAFile' not in options:
        options['tlsCAFile'] = certifi.where()
    return MongoClient(uri, serverSelectionTimeoutMS=serverSelectionTimeoutMS, **options)
