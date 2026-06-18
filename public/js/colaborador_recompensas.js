document.addEventListener('DOMContentLoaded', async () => {
    // 1. Session Auth
    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) throw new Error();
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        document.getElementById('sidebar-username').textContent = user.username;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        fetchRewards();
    } catch (err) {
        window.location.href = '/login.html';
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (err) {}
    });

    // 2. Fetch Rewards
    async function fetchRewards() {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            const tasks = data.tasks || [];
            
            let totalPoints = 0;
            const completedTasks = tasks.filter(t => t.status === 'Completed');
            
            const list = document.getElementById('achievements-list');
            list.innerHTML = '';
            
            completedTasks.forEach(task => {
                totalPoints += (task.points_awarded || 0);
                
                const div = document.createElement('div');
                div.className = "d-flex justify-content-between align-items-center p-3 border-bottom";
                div.innerHTML = `
                    <div>
                        <div class="fw-bold" style="color: var(--tc-primary);">${task.title}</div>
                        <small class="text-muted">Finalizada</small>
                    </div>
                    <div class="text-end">
                        <span class="badge" style="background-color: var(--tc-secondary); font-family: 'JetBrains Mono', monospace;">+${task.points_awarded || 0} pts</span>
                    </div>
                `;
                list.appendChild(div);
            });
            
            if (completedTasks.length === 0) {
                list.innerHTML = `<div class="text-center py-4 text-muted small">Aún no has completado tareas.</div>`;
            }

            document.getElementById('total-points').textContent = totalPoints;

        } catch (err) {
            console.error("Error fetching rewards", err);
        }
    }
});
