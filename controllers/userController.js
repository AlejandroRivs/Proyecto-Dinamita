const UserModel = require('../models/userModel');
const { TaskModel } = require('../models/taskModel');
const bcrypt = require('bcrypt');

class UserController {
  static async getUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      // Remove passwords from response
      const safeUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      return res.json({ success: true, users: safeUsers });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error retrieving users' });
    }
  }

  static async createUser(req, res) {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ success: false, message: 'Username, password and role are required' });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = await UserModel.create(username, hashedPassword, role);
      
      return res.status(201).json({ success: true, message: 'User created successfully', userId });
    } catch (error) {
      console.error(error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      return res.status(500).json({ success: false, message: 'Error creating user' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // First unassign user's tasks
      await TaskModel.unassignUserTasks(id);
      
      // Then delete the user
      await UserModel.delete(id);
      
      return res.json({ success: true, message: 'User deleted and their tasks returned to Pending' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  }
}

module.exports = UserController;
