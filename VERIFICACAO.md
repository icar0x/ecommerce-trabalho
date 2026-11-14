# Verificação local

Ambiente: Windows, Python 3.13.7. Dependências instaladas em `.venv`.

- Suíte `python -m pytest -q`: **19 testes aprovados**, cobrindo autenticação simulada, autorização, CRUD e dinheiro, validações, busca/paginação, histórico, seed, páginas e falhas de serviços.
- Um aviso de depreciação do TestClient/Starlette sobre o transporte httpx; não impede a execução dos testes.
- Compilação dos arquivos Python e `node --check` dos dois scripts JavaScript.
- MongoDB Atlas real: PING, contagem e CRUD confirmados. Um produto temporário foi inserido, lido, editado e removido ao final; nenhum produto anterior foi alterado.
- Supabase real: consulta de configurações HTTP 200 com chave publishable; token deliberadamente inválido rejeitado com HTTP 403 e código `bad_jwt`. Login com credenciais válidas e vínculo entre UUID autorizado e conta ainda precisam de teste no navegador.
- Supabase informou cadastro público habilitado (`disable_signup=false`); desabilitar no painel do projeto conforme README.
- Redis na nuvem real: URI extraída do comando redis-cli informado no `.env`. PING, transação LREM/LPUSH/LTRIM/EXPIRE, leitura e TTL de sete dias confirmados; chave temporária removida ao final.
- Não houve teste visual/interativo do painel em navegador. As páginas e os arquivos estáticos foram verificados por HTTP via TestClient.

Os testes automatizados não usam conexões reais; as verificações manuais dos serviços estão discriminadas acima. O runtime utiliza PyMongo, redis-py e HTTP para o Supabase, sem simulação automática quando há falha. O roteiro de validação real está no README.
