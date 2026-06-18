document.addEventListener('DOMContentLoaded', async () => {
    let usersMap = {};

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
        
        await fetchCollaborators();
        fetchTasks();
    } catch (err) {
        window.location.href = '/login.html';
    }

    async function fetchCollaborators() {
        try {
            const res = await fetch('/api/tasks/collaborators');
            if (res.ok) {
                const data = await res.json();
                const collaborators = data.collaborators || [];
                const select = document.getElementById('taskAssignee');
                select.innerHTML = '<option value="">Sin Asignar (Extra)</option>';
                collaborators.forEach(colab => {
                    usersMap[colab.id] = colab.username;
                    const opt = document.createElement('option');
                    opt.value = colab.id;
                    opt.textContent = colab.username;
                    select.appendChild(opt);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchTasks() {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            const tasks = data.tasks || [];
            
            const tbody = document.getElementById('all-tasks-body');
            tbody.innerHTML = '';
            
            tasks.forEach(task => {
                const tr = document.createElement('tr');
                
                let statusBadge = '';
                if (task.status === 'Completed') statusBadge = `<span class="status-badge bg-secondary text-white">Realizado</span>`;
                else if (task.status === 'In Progress') statusBadge = `<span class="status-badge" style="background-color: rgba(100,36,47,0.1); color: var(--tc-primary);">En Proceso</span>`;
                else if (task.status === 'Paused') statusBadge = `<span class="status-badge" style="background-color: #ffc107; color: #fff;">Pausado</span>`;
                else statusBadge = `<span class="status-badge" style="background-color: #dfd9d8; color: var(--tc-primary);">Pendiente</span>`;

                const assigneeLabel = task.assigned_to && usersMap[task.assigned_to] ? usersMap[task.assigned_to] : (task.assigned_to ? `Usuario #${task.assigned_to}` : 'Sin asignar (Extra)');
                const initial = assigneeLabel !== 'Sin asignar (Extra)' ? assigneeLabel.charAt(0).toUpperCase() : '?';

                let auditBtn = `<button class="btn btn-sm text-muted" onclick="deleteTask(${task.id})" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>`;
                
                if (task.status === 'Completed') {
                    auditBtn += `<button class="btn btn-sm text-danger ms-2" onclick="rejectTask(${task.id})" title="Rechazar Tarea"><span class="material-symbols-outlined">thumb_down</span></button>`;
                }

                tr.innerHTML = `
                    <td class="py-3 px-4">
                        <div class="fw-bold" style="color: var(--tc-primary);">${task.title}</div>
                        <small class="text-muted">${task.description}</small>
                        ${task.is_extra ? '<div class="badge bg-warning mt-1">Extra</div>' : ''}
                    </td>
                    <td class="py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-circle bg-light text-muted">${initial}</div>
                            <span class="small fw-bold">${assigneeLabel}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-tc-tertiary fw-bold" style="font-family: 'JetBrains Mono', monospace;">
                        ${task.complexity} (${task.points_awarded || 0} pts)
                    </td>
                    <td class="py-3 px-4 text-center">
                        ${auditBtn}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            if (tasks.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay tareas.</td></tr>`;
            }
        } catch (err) {
            console.error(err);
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
            
            const is_extra = !assignee;

            try {
                const res = await fetch('/api/tasks/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title: title, 
                        description: desc, 
                        assigned_to: assignee || null,
                        complexity: complexityVal,
                        is_extra: is_extra,
                        time_limit_minutes: 30
                    })
                });
                const data = await res.json();
                
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
                    if (modal) modal.hide();
                    createForm.reset();
                    fetchTasks();
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

    window.deleteTask = async (id) => {
        if (!confirm("¿Eliminar esta tarea?")) return;
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        fetchTasks();
    };

    window.rejectTask = async (id) => {
        if (!confirm("¿Rechazar esta tarea y penalizar al usuario?")) return;
        try {
            const res = await fetch(`/api/tasks/${id}/reject`, { method: 'PUT' });
            const data = await res.json();
            if(res.ok) alert(data.message);
            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });
});
