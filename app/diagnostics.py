"""Diagnóstico de conexão sem devolver URIs, senhas, hosts ou exceções completas."""

import re
from urllib.parse import urlsplit

from pymongo.errors import OperationFailure
from redis.exceptions import AuthenticationError


def connection_failure(service, error, uri):
    host = urlsplit(uri).hostname
    if host in {'localhost', '127.0.0.1', '::1'}:
        return {'status': 'erro', 'codigo': 'configuracao_local',
                'mensagem': f'{service} está configurado para localhost. Configure a conexão remota no ambiente do serviço.'}
    details = str(error).lower()
    if isinstance(error, AuthenticationError) or isinstance(error, OperationFailure) and (error.code in {13, 18} or 'bad auth' in details or 'authentication failed' in details):
        return {'status': 'erro', 'codigo': 'autenticacao',
                'mensagem': f'{service} recusou as credenciais ou permissões. Confira usuário e senha da conexão.'}
    # As mensagens originais são usadas só na classificação e nunca saem do servidor.
    if any(term in details for term in ['certificate_verify_failed', 'certificate verify failed']):
        code, message = 'certificado_tls', 'Não foi possível validar o certificado TLS. Confira a configuração de certificados do ambiente.'
    elif any(term in details for term in ['ssl', 'tls']):
        code, message = 'tls', 'A conexão TLS falhou. Confira o modo TLS, a porta e as regras de acesso do provedor.'
    elif any(term in details for term in ['getaddrinfo', 'name or service not known', 'nodename nor servname', 'nxdomain', 'dns operation', 'resolution lifetime']):
        code, message = 'dns', 'O endereço do banco não foi resolvido. Confira o endpoint e a resolução DNS do serviço.'
    else:
        code = 'conexao'
        message = 'Não foi possível alcançar o banco. Confira endpoint, porta e liberação dos IPs de saída do Render no provedor.'
    result = {'status': 'erro', 'codigo': code, 'mensagem': message}
    # Só códigos OpenSSL conhecidos são expostos; nunca texto ou endereço do erro.
    reason = re.search(r'\[SSL:\s*([A-Z0-9_]+)\]', str(error), re.IGNORECASE)
    known = {'TLSV1_ALERT_INTERNAL_ERROR', 'SSLV3_ALERT_HANDSHAKE_FAILURE', 'WRONG_VERSION_NUMBER',
             'UNSUPPORTED_PROTOCOL', 'NO_SHARED_CIPHER', 'CERTIFICATE_VERIFY_FAILED',
             'UNEXPECTED_EOF_WHILE_READING', 'TLSV1_ALERT_PROTOCOL_VERSION'}
    if code in {'tls', 'certificado_tls'} and reason and reason[1].upper() in known:
        result['motivo'] = reason[1].upper()
    return result
