document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('error-message');
    const togglePassBtn = document.getElementById('togglePassword');
    const passInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    // Toggle Password Visibility
    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            toggleIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.classList.add('d-none');
            
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span class="material-symbols-outlined spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <span>Verificando...</span>`;
            submitBtn.disabled = true;

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/colaborador.html';
                    }
                } else {
                    errorMsg.textContent = data.message || 'Error al iniciar sesión';
                    errorMsg.classList.remove('d-none');
                    submitBtn.innerHTML = originalContent;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error("Error logging in:", error);
                errorMsg.textContent = 'Error de conexión con el servidor.';
                errorMsg.classList.remove('d-none');
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }
});
