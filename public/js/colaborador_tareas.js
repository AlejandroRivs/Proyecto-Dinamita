document.addEventListener('DOMContentLoaded', async () => {
    // 1. Session Auth
    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) throw new Error();
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        document.getElementById('sidebar-username').textContent = user.username;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        fetchMyTasks();
        fetchExtraTasks();
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

    let activeTimers = [];
    let timerInterval = null;

    // 2. Fetch My Tasks
    async function fetchMyTasks() {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            const tasks = data.tasks || [];
            
            const tbody = document.getElementById('my-tasks-body');
            tbody.innerHTML = '';
            
            // Clear previous interval
            if (timerInterval) {
                clearInterval(timerInterval);
                activeTimers = [];
            }
            
            tasks.forEach(task => {
                const tr = document.createElement('tr');
                
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

                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="fw-bold" style="color: var(--tc-primary);">${task.title} <span class="badge bg-light text-muted ms-2">${task.complexity}</span></div>
                        <small class="text-muted">${task.description}</small>
                        ${task.is_extra ? '<div class="badge bg-warning mt-1">Extra</div>' : ''}
                        <div class="mt-2 d-flex align-items-center" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--tc-secondary);">
                            <span class="material-symbols-outlined me-1" style="font-size: 1.1rem;">timer</span> 
                            <span id="timer-${task.id}">${task.formatted_duration || '00:00:00'}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-center">
                        ${actionBtn}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            if (tasks.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No tienes tareas asignadas.</td></tr>`;
            }

            // Start interval if there are active timers
            if (activeTimers.length > 0) {
                timerInterval = setInterval(updateTimers, 1000);
            }
        } catch (err) {
            console.error("Error fetching my tasks", err);
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
            const el = document.getElementById(`timer-${t.id}`);
            if (el) {
                const elapsedSinceFetch = now - t.frontendStartTime;
                const currentDuration = t.durationMs + elapsedSinceFetch;
                el.textContent = formatMsToTime(currentDuration);
            }
        });
    }

    // 3. Fetch Extra Tasks
    async function fetchExtraTasks() {
        try {
            const res = await fetch('/api/tasks?unassigned_extras=true');
            const data = await res.json();
            const tasks = data.tasks || [];
            
            const list = document.getElementById('extra-tasks-list');
            list.innerHTML = '';
            
            tasks.forEach(task => {
                const div = document.createElement('div');
                div.className = "p-3 border rounded mb-3 bg-light";
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong style="color: var(--tc-primary);">${task.title}</strong>
                        <span class="badge" style="background-color: var(--tc-secondary);">+Pts</span>
                    </div>
                    <p class="small text-muted mb-2">${task.description}</p>
                    <div class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="assignExtra(${task.id})">Asignarme</button>
                    </div>
                `;
                list.appendChild(div);
            });
            
            if (tasks.length === 0) {
                list.innerHTML = `<div class="text-center text-muted small py-4">No hay tareas extra disponibles.</div>`;
            }
        } catch (err) {
            console.error("Error fetching extra tasks", err);
        }
    }

    // Actions
    window.startTask = async (id) => {
        await fetch(`/api/tasks/${id}/start`, { method: 'PUT' });
        fetchMyTasks();
    };

    window.pauseTask = async (id) => {
        await fetch(`/api/tasks/${id}/pause`, { method: 'PUT' });
        fetchMyTasks();
    };

    window.completeTask = async (id) => {
        await fetch(`/api/tasks/${id}/finalize`, { method: 'PUT' });
        fetchMyTasks();
    };

    window.assignExtra = async (id) => {
        if(!confirm("¿Deseas asignarte esta tarea extra?")) return;
        await fetch(`/api/tasks/${id}/assign`, { method: 'PUT' });
        fetchExtraTasks();
        fetchMyTasks();
    };
});
