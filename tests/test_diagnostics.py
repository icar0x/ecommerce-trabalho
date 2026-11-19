from pymongo.errors import ConnectionFailure, OperationFailure
from redis.exceptions import AuthenticationError

from app.diagnostics import connection_failure


def test_connection_failure_classifies_without_exposing_private_details():
    uri = 'redis://user:private-password@private-host:12345'
    cases = [
        (AuthenticationError('private-password'), 'autenticacao'),
        (OperationFailure('private-password', code=18), 'autenticacao'),
        (ConnectionFailure('certificate verify failed private-host'), 'certificado_tls'),
        (ConnectionFailure('SSL handshake failed private-password'), 'tls'),
        (ConnectionFailure('getaddrinfo failed private-host'), 'dns'),
        (ConnectionFailure('connection timed out private-host'), 'conexao'),
    ]
    for error, code in cases:
        result = connection_failure('Redis', error, uri)
        assert result['codigo'] == code
        assert 'private-' not in str(result)
    assert connection_failure('MongoDB', ConnectionFailure('error'), 'mongodb://localhost:27017')['codigo'] == 'configuracao_local'
