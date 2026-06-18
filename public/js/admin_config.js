document.addEventListener('DOMContentLoaded', async () => {
    let currentUserId = null;

    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) throw new Error();
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        if (user.role !== 'admin') {
            window.location.href = '/login.html';
            return;
        }
        
        currentUserId = user.id;
        document.getElementById('admin-name').textContent = user.username;
        document.getElementById('admin-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        fetchUsers();
        fetchGlobalLock();
    } catch (err) {
        window.location.href = '/login.html';
    }

    // --- Users ABM ---
    async function fetchUsers() {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error("Error fetching users");
            const data = await res.json();
            const users = data.users || [];
            
            const tbody = document.getElementById('users-body');
            tbody.innerHTML = '';
            
            users.forEach(u => {
                const tr = document.createElement('tr');
                
                let badgeClass = u.role === 'admin' ? 'bg-danger' : 'bg-primary';
                
                let deleteBtn = '';
                if (u.id !== currentUserId) {
                    deleteBtn = `<button class="btn btn-sm text-danger" onclick="deleteUser(${u.id})" title="Eliminar Usuario y liberar tareas">
                        <span class="material-symbols-outlined">delete_forever</span>
                    </button>`;
                } else {
                    deleteBtn = `<span class="badge bg-light text-muted small">Tú</span>`;
                }

                tr.innerHTML = `
                    <td class="py-3 px-4 text-muted" style="font-family: 'JetBrains Mono', monospace;">#${u.id}</td>
                    <td class="py-3 px-4 fw-bold" style="color: var(--tc-primary);">${u.username}</td>
                    <td class="py-3 px-4">
                        <span class="badge ${badgeClass} text-uppercase" style="font-size: 0.65rem;">${u.role}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        ${deleteBtn}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios.</td></tr>`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    const createUserForm = document.getElementById('createUserForm');
    const userError = document.getElementById('userError');
    
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            userError.classList.add('d-none');
            
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const role = document.getElementById('newRole').value;
            
            try {
                const res = await fetch('/api/users/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role })
                });
                const data = await res.json();
                
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
                    if (modal) modal.hide();
                    createUserForm.reset();
                    fetchUsers();
                } else {
                    userError.textContent = data.message || "Error al crear usuario";
                    userError.classList.remove('d-none');
                }
            } catch (err) {
                userError.textContent = "Error de conexión";
                userError.classList.remove('d-none');
            }
        });
    }

    window.deleteUser = async (id) => {
        if (!confirm("¿Eliminar este usuario? Sus tareas asignadas volverán a estado Pendiente.")) return;
        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user", err);
        }
    };

    // --- Global Lock ---
    const globalLockSwitch = document.getElementById('globalLockSwitch');
    const globalLockLabel = document.getElementById('globalLockLabel');

    async function fetchGlobalLock() {
        try {
            const res = await fetch('/api/tasks/global-lock/status');
            const data = await res.json();
            if (res.ok) {
                globalLockSwitch.checked = data.locked;
                updateLockLabel(data.locked);
            }
        } catch (e) {
            console.error(e);
        }
    }

    function updateLockLabel(isLocked) {
        if (isLocked) {
            globalLockLabel.textContent = "ACTIVO";
            globalLockLabel.classList.add('text-danger');
        } else {
            globalLockLabel.textContent = "INACTIVO";
            globalLockLabel.classList.remove('text-danger');
        }
    }

    if (globalLockSwitch) {
        globalLockSwitch.addEventListener('change', async (e) => {
            const lock = e.target.checked;
            updateLockLabel(lock);
            
            try {
                const res = await fetch('/api/tasks/global-lock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lock })
                });
                if (!res.ok) {
                    // Revert UI if failed
                    globalLockSwitch.checked = !lock;
                    updateLockLabel(!lock);
                    alert("Error al cambiar el bloqueo global");
                }
            } catch (err) {
                globalLockSwitch.checked = !lock;
                updateLockLabel(!lock);
                console.error(err);
            }
        });
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });
});
