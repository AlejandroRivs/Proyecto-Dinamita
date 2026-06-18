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
