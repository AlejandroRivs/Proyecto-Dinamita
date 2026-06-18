document.addEventListener('DOMContentLoaded', async () => {
    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) throw new Error();
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        if (user.role !== 'admin') {
            window.location.href = '/login.html';
            return;
        }
        
        document.getElementById('admin-name').textContent = user.username;
        document.getElementById('admin-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        fetchCollaborators();
    } catch (err) {
        window.location.href = '/login.html';
    }

    async function fetchCollaborators() {
        try {
            const res = await fetch('/api/tasks/collaborators');
            if (res.ok) {
                const data = await res.json();
                const collaborators = data.collaborators || [];
                
                // Sort by points descending
                collaborators.sort((a, b) => (b.points || 0) - (a.points || 0));

                const tbody = document.getElementById('colabs-body');
                tbody.innerHTML = '';
                
                collaborators.forEach((colab, index) => {
                    const tr = document.createElement('tr');
                    
                    let medal = '';
                    if (index === 0 && colab.points > 0) medal = '<span class="material-symbols-outlined text-warning" style="font-variation-settings:\'FILL\' 1;">workspace_premium</span>';
                    else if (index === 1 && colab.points > 0) medal = '<span class="material-symbols-outlined" style="color: #c0c0c0; font-variation-settings:\'FILL\' 1;">workspace_premium</span>';
                    else if (index === 2 && colab.points > 0) medal = '<span class="material-symbols-outlined" style="color: #cd7f32; font-variation-settings:\'FILL\' 1;">workspace_premium</span>';

                    tr.innerHTML = `
                        <td class="py-3 px-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="avatar-circle" style="background-color: var(--tc-secondary);">${colab.username.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div class="fw-bold" style="color: var(--tc-primary);">${colab.username}</div>
                                    <small class="text-muted">Colaborador #${colab.id}</small>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-end">
                            <div class="d-flex align-items-center justify-content-end gap-2">
                                <span class="fs-5 fw-bold" style="color: var(--tc-primary); font-family: 'JetBrains Mono', monospace;">${colab.points || 0} pts</span>
                                ${medal}
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                if (collaborators.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">No hay colaboradores.</td></tr>`;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });
});
