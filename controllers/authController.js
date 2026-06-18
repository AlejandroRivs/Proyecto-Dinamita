// ============================================================
// controllers/authController.js - Maneja login, logout, sesión y permisos
// Recibe la petición, valida credenciales y gestiona la sesión
// ============================================================
const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuarioModel');

const AuthController = {
  // POST /auth/login - Iniciar sesión
  async login(req, res) {
    const { email, contrasena } = req.body;

    // Validar que se enviaron ambos campos
    if (!email || !contrasena) {
      return res.status(400).json({ exito: false, mensaje: 'El correo y la contraseña son obligatorios' });
    }

    try {
      // Buscar el usuario en la base de datos por su email
      const usuarioEncontrado = await UsuarioModel.buscarPorEmail(email.trim().toLowerCase());

      if (!usuarioEncontrado) {
        // No revelar si el email existe o no (buena práctica de seguridad)
        return res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
      }

      // Comparar la contraseña ingresada con el hash guardado en la BD
      const contrasenaCorrecta = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

      if (!contrasenaCorrecta) {
        return res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
      }

      // Guardar los datos del usuario en la sesión (sin la contraseña)
      req.session.usuario = {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        email: usuarioEncontrado.email,
        rol: usuarioEncontrado.rol
      };

      // Responder con los datos del usuario y su rol para redirigir en el cliente
      return res.json({ exito: true, mensaje: `Bienvenido, ${usuarioEncontrado.nombre}`, usuario: req.session.usuario });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
  },

  // POST /auth/logout - Cerrar sesión
  logout(req, res) {
    // Destruir la sesión en el servidor
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ exito: false, mensaje: 'No se pudo cerrar la sesión' });
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
  },

  

  // Verificar que el usuario tiene una sesión activa (está logueado)
  verificarSesion(req, res, next) {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión para acceder a este recurso' });
    }
    next();
  },

  // Verificar que el usuario logueado tiene rol de administrador
  verificarAdmin(req, res, next) {
    // Asegurar que req.session.usuario existe antes de leer el rol
    if (!req.session || !req.session.usuario || req.session.usuario.rol !== 'admin') {
      return res.status(403).json({ exito: false, mensaje: 'Solo el administrador puede realizar esta acción' });
    }
    next();
  }
};

module.exports = AuthController;

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
const Usuario = require('../models/usuarioModel');

class AuthController {
  /**
   * Gestionar la lógica del login.
   * @param {Object} req - Objeto de petición Express.
   * @param {Object} res - Objeto de respuesta Express.
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validación simple de campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Por favor, ingrese el email y la contraseña.'
        });
      }

      // Buscar el usuario por email
      const usuario = await Usuario.findByEmail(email);

      // Si el usuario no existe
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'El correo electrónico no está registrado.'
        });
      }

      // Validar la contraseña (comparación en texto plano para el prototipo/pruebas)
      if (usuario.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña es incorrecta.'
        });
      }

      // Simular respuestas de éxito personalizadas según el rol de la historia de usuario
      let mensajeRol = '';
      switch (usuario.rol) {
        case 'admin':
          mensajeRol = 'Acceso total al sistema concedido. Bienvenido Administrador.';
          break;
        case 'lider':
          mensajeRol = 'Acceso de gestión de tiempos de grupo concedido. Bienvenido Líder.';
          break;
        case 'colaborador':
          mensajeRol = 'Acceso a tareas de desarrollo concedido. Bienvenido Colaborador.';
          break;
        default:
          mensajeRol = 'Acceso concedido.';
      }

      // Retornar éxito con la información del usuario y su rol
      return res.status(200).json({
        success: true,
        message: '¡Inicio de sesión exitoso!',
        mensajeRol,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });

    } catch (error) {
      console.error('Error en AuthController.login:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error interno en el servidor.'
      });
    }
  }
}

module.exports = AuthController;
