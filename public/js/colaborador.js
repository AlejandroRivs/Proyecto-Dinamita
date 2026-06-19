document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Session Info
    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
            window.location.href = '/login.html';
            return;
        }
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        document.getElementById('sidebar-username').textContent = user.username;
        document.getElementById('welcome-message').textContent = `¡Hola, ${user.username}!`;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        // Let's assume we store points in session or calculate them from completed tasks
        // For now we'll fetch tasks to sum up points
        fetchTasks(user.id);
    } catch (err) {
        console.error("Session fetch error", err);
        window.location.href = '/login.html';
    }

    let activeTimers = [];
    let timerInterval = null;

    // 2. Fetch Tasks
    async function fetchTasks(userId) {
        try {
            const res = await fetch('/api/tasks');
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const tasks = await res.json();
            
            const tbody = document.getElementById('tasks-table-body');
            tbody.innerHTML = '';
            
            let totalPoints = 0;
            const taskList = tasks.tasks || [];
            
            if (timerInterval) {
                clearInterval(timerInterval);
                activeTimers = [];
            }
            
            taskList.forEach(task => {
                if (task.status === 'Completed') {
                    totalPoints += (task.points_awarded || 0);
                }

                // Create row
                const tr = document.createElement('tr');
                
                // Status Badge logic
                let statusBadge = '';
                let actionBtn = '';
                
                if (task.status === 'Completed') {
                    statusBadge = `<span class="status-badge status-completed text-uppercase">Realizado</span>`;
                    actionBtn = `<button class="btn btn-sm text-muted" disabled><span class="material-symbols-outlined">check_circle</span></button>`;
                } else if (task.status === 'In Progress') {
                    statusBadge = `<span class="status-badge status-progress text-uppercase">En Proceso</span>`;
                    actionBtn = `
                        <button class="btn btn-sm text-tc-primary border-0" onclick="pauseTask(${task.id})" title="Pausar"><span class="material-symbols-outlined">pause_circle</span></button>
                        <button class="btn btn-sm text-success border-0" onclick="completeTask(${task.id})" title="Finalizar"><span class="material-symbols-outlined">check_circle</span></button>
                    `;
                    activeTimers.push({
                        id: task.id,
                        durationMs: task.total_duration_ms || 0,
                        frontendStartTime: Date.now()
                    });
                } else if (task.status === 'Paused') {
                    statusBadge = `<span class="status-badge" style="background-color: #ffc107; color: #fff;">Pausado</span>`;
                    actionBtn = `<button class="btn btn-sm text-tc-secondary border-0" onclick="startTask(${task.id})" title="Reanudar"><span class="material-symbols-outlined">play_circle</span></button>`;
                } else {
                    statusBadge = `<span class="status-badge status-pending text-uppercase">Pendiente</span>`;
                    actionBtn = `<button class="btn btn-sm text-tc-secondary border-0" onclick="startTask(${task.id})" title="Iniciar"><span class="material-symbols-outlined">play_circle</span></button>`;
                }

                let pointsText = task.status === 'Completed' ? `+${task.points_awarded} pts` : '--';

                let timerHtml = '';
                if (task.status === 'In Progress' || task.status === 'Paused' || task.status === 'Completed') {
                    timerHtml = `
                        <div class="mt-2 d-flex align-items-center" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--tc-secondary);">
                            <span class="material-symbols-outlined me-1" style="font-size: 1.1rem;">timer</span> 
                            <span id="dash-timer-${task.id}">${task.formatted_duration || '00:00:00'}</span>
                        </div>
                    `;
                }

                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="fw-bold" style="color: var(--tc-primary);">${task.title}</div>
                        <small class="text-muted">${task.description}</small>
                        ${timerHtml}
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-end">
                        <span class="badge text-tc-primary" style="background-color: rgba(252,143,143,0.3); font-family: 'JetBrains Mono', monospace;">${pointsText}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        ${actionBtn}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            if (taskList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay tareas asignadas.</td></tr>`;
            }

            // Update user points
            document.getElementById('user-points').textContent = totalPoints;

            if (activeTimers.length > 0) {
                timerInterval = setInterval(updateTimers, 1000);
            }

        } catch (err) {
            console.error("Error fetching tasks", err);
        }
    }

    function formatMsToTime(ms) {
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateTimers() {
        const now = Date.now();
        activeTimers.forEach(t => {
            const el = document.getElementById(`dash-timer-${t.id}`);
            if (el) {
                const elapsedSinceFetch = now - t.frontendStartTime;
                const currentDuration = t.durationMs + elapsedSinceFetch;
                el.textContent = formatMsToTime(currentDuration);
            }
        });
    }

    // Handlers mapped to global scope for onclick
    window.startTask = async (id) => {
        try {
            await fetch(`/api/tasks/${id}/start`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            window.location.reload();
        } catch (e) {
            console.error("Error starting task", e);
        }
    };

    window.pauseTask = async (id) => {
        try {
            await fetch(`/api/tasks/${id}/pause`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            window.location.reload();
        } catch (e) {
            console.error("Error pausing task", e);
        }
    };

    window.completeTask = async (id) => {
        try {
            await fetch(`/api/tasks/${id}/finalize`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            window.location.reload();
        } catch (e) {
            console.error("Error completing task", e);
        }
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (err) {
            console.error('Logout error', err);
        }
    });

    // Date/Time Clock
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let formattedDate = now.toLocaleDateString('es-ES', options);
        document.getElementById('current-date').textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
});
