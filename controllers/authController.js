const UsuarioModel = require('../models/usuarioModel');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const user = await UsuarioModel.findByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        points: user.points
      };

      return res.json({ message: 'Login exitoso', user: req.session.user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
      }
      return res.json({ message: 'Sesión cerrada correctamente' });
    });
  }

  static async getSession(req, res) {
    if (req.session && req.session.user) {
      // Obtener puntos frescos de la BD para la sesión
      const user = await UsuarioModel.findById(req.session.user.id);
      req.session.user.points = user.points;
      return res.json({ loggedIn: true, user: req.session.user });
    }
    return res.json({ loggedIn: false });
  }
}

module.exports = AuthController;
