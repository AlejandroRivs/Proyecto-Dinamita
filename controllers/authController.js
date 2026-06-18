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
