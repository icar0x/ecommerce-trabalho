const form = document.querySelector('#login-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const message = document.querySelector('#message');
  button.disabled = true;
  message.textContent = 'Verificando acesso…';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: form.email.value, password: form.password.value}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.erro?.mensagem || 'Não foi possível entrar.');
    sessionStorage.setItem('admin_token', data.dados.access_token);
    form.password.value = '';
    location.replace('/admin');
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});
