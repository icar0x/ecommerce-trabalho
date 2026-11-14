import httpx
from fastapi import HTTPException


class SupabaseAuth:
    """Chamadas REST sem sessão compartilhada entre usuários."""

    def __init__(self, settings, client):
        self.settings = settings
        self.client = client

    def call(self, method, path, token=None, **kwargs):
        if not self.settings.supabase_url or not self.settings.supabase_key:
            raise HTTPException(503, 'Configure SUPABASE_URL e SUPABASE_KEY.')
        headers = {'apikey': self.settings.supabase_key}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        try:
            response = self.client.request(
                method, f'{self.settings.supabase_url.rstrip("/")}/auth/v1/{path}',
                headers=headers, **kwargs,
            )
        except httpx.RequestError:
            raise HTTPException(503, 'Supabase indisponível.') from None
        if response.status_code in (400, 401, 403, 422):
            raise HTTPException(401, 'Credenciais ou token inválidos.')
        if response.is_error:
            raise HTTPException(503, 'Falha ao consultar Supabase.')
        return response.json() if response.content else None

    def admin(self, token):
        user = self.call('GET', 'user', token)
        if user.get('id') not in self.settings.admins:
            raise HTTPException(403, 'Usuário não autorizado como administrador.')
        return user

    def login(self, email, password):
        data = self.call('POST', 'token?grant_type=password', json={'email': email, 'password': password})
        self.admin(data['access_token'])
        return {'access_token': data['access_token'], 'token_type': 'bearer', 'expires_in': data['expires_in']}

    def logout(self, token):
        self.call('POST', 'logout?scope=local', token)
