const db = require('../db/conexion');

class UsuarioModel {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAllColaboradores() {
    const [rows] = await db.query("SELECT id, username, role, points FROM users WHERE role = 'colaborador'");
    return rows;
  }
}

module.exports = UsuarioModel;
const db = require('../config/db');

// Datos simulados en memoria para pruebas en caso de que MySQL no esté configurado o disponible
const USUARIOS_MOCK = [
  { id: 1, nombre: 'Administrador Sistema (Simulado)', email: 'admin@dinamita.com', password: 'admin123', rol: 'admin' },
  { id: 2, nombre: 'Líder de Grupo (Simulado)', email: 'lider@dinamita.com', password: 'lider123', rol: 'lider' },
  { id: 3, nombre: 'Colaborador Técnico (Simulado)', email: 'colaborador@dinamita.com', password: 'colaborador123', rol: 'colaborador' }
];

class Usuario {
  /**
   * Buscar un usuario por su correo electrónico.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<Object|null>} El usuario encontrado o null.
   */
  static async findByEmail(email) {
    try {
      const sql = 'SELECT id, nombre, email, password, rol, created_at FROM usuario WHERE email = ?';
      const [rows] = await db.execute(sql, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      // Si la conexión falla, se activa el fallback para facilitar las pruebas locales del Frontend
      const connectionErrors = ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND', 'ER_BAD_DB_ERROR', 'PROTOCOL_CONNECTION_LOST'];
      
      if (connectionErrors.includes(error.code) || error.message.includes('Access denied')) {
        console.warn(`\n⚠️  [DATABASE WARNING] No se pudo conectar a MySQL (${error.code || error.message}).`);
        console.warn(`👉 Usando fallback de datos simulados en memoria para las pruebas del Login.\n`);
        
        const usuarioMock = USUARIOS_MOCK.find(u => u.email === email);
        return usuarioMock || null;
      }
      
      console.error('Error en Usuario.findByEmail:', error);
      throw error;
    }
  }
}

module.exports = Usuario;
