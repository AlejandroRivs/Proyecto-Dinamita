const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const isMatch = (user.password === password) || (await bcrypt.compare(password, user.password).catch(() => false));
      
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        points: user.points
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: req.session.user
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out' });
      }
      return res.json({ success: true, message: 'Logout successful' });
    });
  }

  static async getSession(req, res) {
    if (req.session && req.session.user) {
      const user = await UserModel.findById(req.session.user.id);
      if (user) {
         req.session.user.points = user.points;
      }
      return res.json({ loggedIn: true, user: req.session.user });
    }
    return res.json({ loggedIn: false });
  }

  static verifySession(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Please log in.' });
    }
    next();
  }

  static verifyAdmin(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    next();
  }
}

module.exports = AuthController;
