// ============================================================
// controllers/authController.js - Maneja login y logout
// Recibe la petición, valida credenciales y gestiona la sesión
// ============================================================

const bcrypt        = require('bcrypt');
const UsuarioModel  = require('../models/usuarioModel');

const AuthController = {

  // POST /auth/login - Iniciar sesión
  async login(req, res) {
    const { email, contrasena } = req.body;

    // Validar que se enviaron ambos campos
    if (!email || !contrasena) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El correo y la contraseña son obligatorios'
      });
    }

    try {
      // Buscar el usuario en la base de datos por su email
      const usuarioEncontrado = await UsuarioModel.buscarPorEmail(email.trim().toLowerCase());

      if (!usuarioEncontrado) {
        // No revelar si el email existe o no (buena práctica de seguridad)
        return res.status(401).json({
          exito:   false,
          mensaje: 'Credenciales incorrectas'
        });
      }

      // Comparar la contraseña ingresada con el hash guardado en la BD
      const contrasenaCorrecta = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

      if (!contrasenaCorrecta) {
        return res.status(401).json({
          exito:   false,
          mensaje: 'Credenciales incorrectas'
        });
      }

      // Guardar los datos del usuario en la sesión (sin la contraseña)
      req.session.usuario = {
        id:     usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        email:  usuarioEncontrado.email,
        rol:    usuarioEncontrado.rol
      };

      // Responder con los datos del usuario y su rol para redirigir en el cliente
      return res.json({
        exito:   true,
        mensaje: `Bienvenido, ${usuarioEncontrado.nombre}`,
        usuario: req.session.usuario
      });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({
        exito:   false,
        mensaje: 'Error interno del servidor'
      });
    }
  },

  // POST /auth/logout - Cerrar sesión
  logout(req, res) {
    // Destruir la sesión en el servidor
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({
          exito:   false,
          mensaje: 'No se pudo cerrar la sesión'
        });
      }
      // Sesión destruida correctamente
      res.json({ exito: true, mensaje: 'Sesión cerrada correctamente' });
    });
  },

  // GET /auth/me - Obtener datos del usuario actual (para el frontend)
  me(req, res) {
    if (!req.session.usuario) {
      return res.status(401).json({ exito: false, autenticado: false });
    }
    res.json({ exito: true, autenticado: true, usuario: req.session.usuario });
  }

};

module.exports = AuthController;
