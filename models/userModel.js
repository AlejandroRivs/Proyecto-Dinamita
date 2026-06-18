const db = require('../db/conexion');

class UserModel {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAllCollaborators() {
    const [rows] = await db.query("SELECT id, username, role, points FROM users WHERE role = 'colaborador'");
    return rows;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT id, username, role, points FROM users");
    return rows;
  }

  static async create(username, password, role) {
    const [result] = await db.query(
      "INSERT INTO users (username, password, role, points) VALUES (?, ?, ?, 0)",
      [username, password, role]
    );
    return result.insertId;
  }

  static async delete(id) {
    await db.query("DELETE FROM users WHERE id = ?", [id]);
  }
}

module.exports = UserModel;
