const { TaskModel } = require('../models/taskModel');
const UserModel = require('../models/userModel');

const TEXT_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,\-\n]+$/;

function formatMsToTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

class TaskController {
  static async getTasks(req, res) {
    try {
      const user = req.session.user;
      let tasks = [];
      if (req.query.unassigned_extras === 'true') {
        tasks = await TaskModel.findUnassignedExtras();
      } else if (user.role === 'admin') {
        tasks = await TaskModel.findAll();
      } else {
        tasks = await TaskModel.findByCollaborator(user.id);
      }

      const processedTasks = tasks.map(task => {
        let liveDurationMs = Number(task.total_duration_ms) || 0;
        if (task.status === 'In Progress' && task.last_started_at) {
          const now = new Date();
          const lastStarted = new Date(task.last_started_at);
          liveDurationMs += (now.getTime() - lastStarted.getTime());
        }
        return {
          ...task,
          total_duration_ms: liveDurationMs,
          formatted_duration: formatMsToTime(liveDurationMs)
        };
      });

      return res.json({ success: true, tasks: processedTasks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error retrieving tasks' });
    }
  }

  static async createTask(req, res) {
    try {
      const { title, description, assigned_to, time_limit_minutes, is_extra, complexity } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }
      if (!TEXT_PATTERN.test(title.trim()) || !TEXT_PATTERN.test(description.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid characters in title or description' });
      }

      const taskId = await TaskModel.create({
        title: title.trim(),
        description: description.trim(),
        assigned_to: assigned_to ? parseInt(assigned_to) : null,
        time_limit_minutes,
        is_extra: !!is_extra,
        complexity
      });

      return res.status(201).json({ success: true, message: 'Task created successfully', taskId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error creating task' });
    }
  }

  static async startTask(req, res) {
    try {
      await TaskModel.start(req.params.id);
      return res.json({ success: true, message: 'Task started successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async pauseTask(req, res) {
    try {
      await TaskModel.pause(req.params.id);
      return res.json({ success: true, message: 'Task paused successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async finalizeTask(req, res) {
    try {
      await TaskModel.finalize(req.params.id);
      return res.json({ success: true, message: 'Task finalized successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async rejectTask(req, res) {
    try {
      await TaskModel.reject(req.params.id);
      return res.json({ success: true, message: 'Task rejected and penalty applied' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async toggleGlobalLock(req, res) {
    try {
      const { lock } = req.body;
      await TaskModel.toggleGlobalLock(lock);
      return res.json({ success: true, message: `Global lock ${lock ? 'enabled' : 'disabled'}` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error toggling global lock' });
    }
  }

  static async getGlobalLockStatus(req, res) {
    try {
      const locked = await TaskModel.getGlobalLockStatus();
      return res.json({ success: true, locked });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error fetching lock status' });
    }
  }

  static async getCollaborators(req, res) {
    try {
      const collaborators = await UserModel.findAllCollaborators();
      return res.json({ success: true, collaborators });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error retrieving collaborators' });
    }
  }

  static async selfAssignTask(req, res) {
    try {
      const user = req.session.user;
      await TaskModel.assignToUser(req.params.id, user.id);
      return res.json({ success: true, message: 'Extra task self-assigned successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      await TaskModel.delete(req.params.id);
      return res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error deleting task' });
    }
  }
}

module.exports = TaskController;
