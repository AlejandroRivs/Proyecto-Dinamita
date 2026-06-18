const db = require('../db/conexion');

const CONFIG = {
  PP_POR_HORA_AHORRADA: Number(process.env.PP_POR_HORA_AHORRADA) || 10,
  PP_COMPLEJIDAD_SIMPLE: Number(process.env.PP_COMPLEJIDAD_SIMPLE) || 5,
  PP_COMPLEJIDAD_MEDIA: Number(process.env.PP_COMPLEJIDAD_MEDIA) || 15,
  PP_COMPLEJIDAD_COMPLEJA: Number(process.env.PP_COMPLEJIDAD_COMPLEJA) || 30,
  PP_PENALIZACION_ERROR: Number(process.env.PP_PENALIZACION_ERROR) || 5
};

class TaskModel {
  static async create({ title, description, assigned_to, time_limit_minutes, is_extra, complexity }) {
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, assigned_to, time_limit_minutes, is_extra, complexity) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, assigned_to, time_limit_minutes || 30, is_extra ? 1 : 0, complexity || 'Simple']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query(`
      SELECT t.*, u.username as collaborator_name 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id
    `);
    return rows;
  }

  static async findByCollaborator(userId) {
    const [rows] = await db.query('SELECT * FROM tasks WHERE assigned_to = ?', [userId]);
    return rows;
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  }

  static async start(id) {
    const task = await this.findById(id);
    if (!task) throw new Error('Task not found');
    if (task.global_locked) throw new Error('Task globally locked by admin');
    if (task.status === 'Completed') throw new Error('Cannot start a completed task');
    if (task.status === 'In Progress') return;

    const now = new Date();
    await db.query(
      'UPDATE tasks SET status = ?, last_started_at = ? WHERE id = ?',
      ['In Progress', now, id]
    );
  }

  static async pause(id) {
    const task = await this.findById(id);
    if (!task) throw new Error('Task not found');
    if (task.global_locked) throw new Error('Task globally locked by admin');
    if (task.status !== 'In Progress') throw new Error('Task is not in progress');

    const now = new Date();
    const lastStarted = new Date(task.last_started_at);
    const elapsed = now.getTime() - lastStarted.getTime();
    const newTotalDuration = (Number(task.total_duration_ms) || 0) + elapsed;

    await db.query(
      'UPDATE tasks SET status = ?, total_duration_ms = ?, last_started_at = NULL WHERE id = ?',
      ['Paused', newTotalDuration, id]
    );
  }

  static async finalize(id) {
    const task = await this.findById(id);
    if (!task) throw new Error('Task not found');
    if (task.global_locked) throw new Error('Task globally locked by admin');
    if (task.status === 'Completed') return;

    const now = new Date();
    let newTotalDuration = Number(task.total_duration_ms) || 0;

    if (task.status === 'In Progress' && task.last_started_at) {
      const lastStarted = new Date(task.last_started_at);
      const elapsed = now.getTime() - lastStarted.getTime();
      newTotalDuration += elapsed;
    }

    let pointsFromTime = 0;
    let pointsFromComplexity = 0;

    const timeLimitMs = (Number(task.time_limit_minutes) || 30) * 60 * 1000;
    const timeSavedMs = timeLimitMs - newTotalDuration;

    if (timeSavedMs > 0) {
      const timeSavedHours = timeSavedMs / (1000 * 60 * 60);
      pointsFromTime = Math.round(timeSavedHours * CONFIG.PP_POR_HORA_AHORRADA);
    }

    if (task.is_extra) {
      if (task.complexity === 'Simple') {
        pointsFromComplexity = CONFIG.PP_COMPLEJIDAD_SIMPLE;
      } else if (task.complexity === 'Media') {
        pointsFromComplexity = CONFIG.PP_COMPLEJIDAD_MEDIA;
      } else if (task.complexity === 'Compleja') {
        pointsFromComplexity = CONFIG.PP_COMPLEJIDAD_COMPLEJA;
      }
    }

    const totalPointsAwarded = pointsFromTime + pointsFromComplexity;

    await db.query(
      'UPDATE tasks SET status = ?, total_duration_ms = ?, last_started_at = NULL, points_awarded = ? WHERE id = ?',
      ['Completed', newTotalDuration, totalPointsAwarded, id]
    );

    if (task.assigned_to) {
      await db.query(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [totalPointsAwarded, task.assigned_to]
      );
    }
  }

  static async reject(id) {
    const task = await this.findById(id);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'Completed') throw new Error('Only completed tasks can be rejected');

    const previousPoints = Number(task.points_awarded) || 0;
    const penaltyPoints = previousPoints + CONFIG.PP_PENALIZACION_ERROR;

    await db.query(
      "UPDATE tasks SET status = 'Pending', total_duration_ms = 0, points_awarded = 0 WHERE id = ?",
      [id]
    );

    if (task.assigned_to) {
      await db.query(
        'UPDATE users SET points = GREATEST(0, points - ?) WHERE id = ?',
        [penaltyPoints, task.assigned_to]
      );
    }
  }

  static async toggleGlobalLock(lock) {
    const isLocked = lock ? 1 : 0;

    if (isLocked) {
      const [inProgressTasks] = await db.query("SELECT * FROM tasks WHERE status = 'In Progress'");
      const now = new Date();

      for (const task of inProgressTasks) {
        const lastStarted = new Date(task.last_started_at);
        const elapsed = now.getTime() - lastStarted.getTime();
        const newTotalDuration = (Number(task.total_duration_ms) || 0) + elapsed;

        await db.query(
          "UPDATE tasks SET status = 'Paused', total_duration_ms = ?, last_started_at = NULL, global_locked = 1 WHERE id = ?",
          [newTotalDuration, task.id]
        );
      }
    }

    await db.query('UPDATE tasks SET global_locked = ?', [isLocked]);
  }

  static async findUnassignedExtras() {
    const [rows] = await db.query('SELECT * FROM tasks WHERE is_extra = 1 AND assigned_to IS NULL');
    return rows;
  }

  static async assignToUser(taskId, userId) {
    const task = await this.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (!task.is_extra) throw new Error('Only extra tasks can be self-assigned');
    if (task.assigned_to !== null) throw new Error('Task already assigned');

    await db.query('UPDATE tasks SET assigned_to = ? WHERE id = ?', [userId, taskId]);
  }

  static async delete(id) {
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
  }

  static async unassignUserTasks(userId) {
    await db.query("UPDATE tasks SET assigned_to = NULL, status = 'Pending', total_duration_ms = 0 WHERE assigned_to = ?", [userId]);
  }

  static async getGlobalLockStatus() {
    const [rows] = await db.query("SELECT MAX(global_locked) as locked FROM tasks");
    return rows[0] && rows[0].locked ? true : false;
  }
}

module.exports = { TaskModel, CONFIG };
