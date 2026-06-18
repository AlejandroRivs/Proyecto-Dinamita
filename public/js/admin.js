document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Session Info
    let usersMap = {};

    try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
            window.location.href = '/login.html';
            return;
        }
        const sessionData = await sessionRes.json();
        const user = sessionData.user;
        
        if (user.role !== 'admin') {
            window.location.href = '/login.html';
            return;
        }
        
        document.getElementById('admin-name').textContent = user.username;
        document.getElementById('welcome-message').textContent = `¡Hola, ${user.username}!`;
        document.getElementById('admin-avatar').textContent = user.username.charAt(0).toUpperCase();
        
        await fetchCollaborators();
        fetchAdminData();
    } catch (err) {
        console.error("Session fetch error", err);
        window.location.href = '/login.html';
    }

    // 1.5 Fetch Collaborators
    async function fetchCollaborators() {
        try {
            const res = await fetch('/api/tasks/collaborators');
            if (res.ok) {
                const data = await res.json();
                const collaborators = data.collaborators || [];
                const select = document.getElementById('taskAssignee');
                if (select) {
                    select.innerHTML = '<option value="">Sin Asignar (Extra)</option>';
                    collaborators.forEach(colab => {
                        usersMap[colab.id] = colab.username;
                        const opt = document.createElement('option');
                        opt.value = colab.id;
                        opt.textContent = colab.username;
                        select.appendChild(opt);
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching collaborators", error);
        }
    }

    // 2. Fetch Admin Data (Tasks)
    async function fetchAdminData() {
        try {
            const tasksRes = await fetch('/api/tasks');
            const data = await tasksRes.ok ? await tasksRes.json() : { tasks: [] };
            const tasks = data.tasks || [];
            
            const tbody = document.getElementById('admin-tasks-body');
            tbody.innerHTML = '';
            
            let totalTasks = tasks.length;
            let completedTasks = 0;
            let totalPoints = 0;
            
            tasks.forEach(task => {
                if (task.status === 'Completed') {
                    completedTasks++;
                    totalPoints += (task.points_awarded || 0);
                }

                // Render row
                const tr = document.createElement('tr');
                
                let statusBadge = '';
                if (task.status === 'Completed') {
                    statusBadge = `<span class="status-badge bg-secondary text-white">Realizado</span>`;
                } else if (task.status === 'In Progress') {
                    statusBadge = `<span class="status-badge" style="background-color: rgba(100,36,47,0.1); color: var(--tc-primary);">En Proceso</span>`;
                } else if (task.status === 'Paused') {
                    statusBadge = `<span class="status-badge" style="background-color: #ffc107; color: #fff;">Pausado</span>`;
                } else {
                    statusBadge = `<span class="status-badge" style="background-color: #dfd9d8; color: var(--tc-primary);">Pendiente</span>`;
                }

                const assigneeLabel = task.assigned_to && usersMap[task.assigned_to] ? usersMap[task.assigned_to] : (task.assigned_to ? `Usuario #${task.assigned_to}` : 'Sin asignar (Extra)');
                const initial = assigneeLabel !== 'Sin asignar (Extra)' ? assigneeLabel.charAt(0).toUpperCase() : '?';

                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="fw-bold" style="color: var(--tc-primary);">${task.title}</div>
                        <small class="text-muted">${task.description}</small>
                    </td>
                    <td class="py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-circle bg-light text-muted">${initial}</div>
                            <span class="small fw-bold">${assigneeLabel}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-tc-tertiary fw-bold" style="font-family: 'JetBrains Mono', monospace;">
                        ${task.status === 'Completed' ? '+' + task.points_awarded : '--'} pts
                    </td>
                    <td class="py-3 px-4 text-center">
                        <button class="btn btn-sm text-muted" onclick="deleteTask(${task.id})" title="Eliminar">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            if (tasks.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay tareas en el sistema.</td></tr>`;
            }

            // Update KPIs
            document.getElementById('total-tasks-kpi').textContent = totalTasks;
            document.getElementById('completed-tasks-kpi').textContent = completedTasks;
            document.getElementById('points-kpi').textContent = totalPoints;
            
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
    }

    const createForm = document.getElementById('createTaskForm');
    const taskError = document.getElementById('taskError');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (taskError) taskError.classList.add('d-none');
            const title = document.getElementById('taskTitle').value;
            const desc = document.getElementById('taskDesc').value;
            const assignee = document.getElementById('taskAssignee').value;
            const complexityVal = document.getElementById('taskComplexity').value;
            
            // Map complexity 1,2,3 to Simple, Media, Compleja
            let complexityEnum = 'Simple';
            if(complexityVal === '2') complexityEnum = 'Media';
            if(complexityVal === '3') complexityEnum = 'Compleja';
            
            const is_extra = !assignee;

            try {
                const res = await fetch('/api/tasks/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title: title, 
                        description: desc, 
                        assigned_to: assignee || null,
                        complexity: complexityEnum,
                        is_extra: is_extra,
                        time_limit_minutes: 30
                    })
                });
                const data = await res.json();
                
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
                    if (modal) modal.hide();
                    createForm.reset();
                    fetchAdminData();
                } else {
                    if (taskError) {
                        taskError.textContent = data.message || "Error al crear la tarea";
                        taskError.classList.remove('d-none');
                    } else {
                        alert(data.message || "Error al crear la tarea");
                    }
                }
            } catch (err) {
                if (taskError) {
                    taskError.textContent = "Error de conexión al crear la tarea";
                    taskError.classList.remove('d-none');
                } else {
                    alert("Error de conexión al crear la tarea");
                }
            }
        });
    }

    // Delete Task
    window.deleteTask = async (id) => {
        if (!confirm("¿Eliminar esta tarea?")) return;
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            fetchAdminData();
        } catch (err) {
            console.error("Error deleting task", err);
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
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('live-clock').textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
});
