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
