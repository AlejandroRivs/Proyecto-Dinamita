const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  const dbName = process.env.DB_NAME || 'dynamite';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MYsqlPLUS'
  });

  try {
    console.log(`Verificando/Creando base de datos: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    // Crear Tabla de Usuarios
    console.log('Verificando tabla: users');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'colaborador') NOT NULL,
        points INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Crear Tabla de Tareas
    console.log('Verificando tabla: tasks');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        assigned_to INT,
        status ENUM('Pending', 'In Progress', 'Paused', 'Completed') DEFAULT 'Pending',
        total_duration_ms BIGINT DEFAULT 0,
        last_started_at DATETIME DEFAULT NULL,
        time_limit_minutes INT DEFAULT 30,
        is_extra BOOLEAN DEFAULT FALSE,
        complexity ENUM('Simple', 'Media', 'Compleja') DEFAULT 'Simple',
        points_awarded INT DEFAULT 0,
        global_locked BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Asegurar compatibilidad si la tabla ya existía
    try {
      await connection.query("ALTER TABLE tasks ADD COLUMN complexity ENUM('Simple', 'Media', 'Compleja') DEFAULT 'Simple'");
      console.log('Columna "complexity" agregada.');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') console.error(err);
    }

    try {
      await connection.query("ALTER TABLE tasks ADD COLUMN points_awarded INT DEFAULT 0");
      console.log('Columna "points_awarded" agregada.');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') console.error(err);
    }

    // Insertar Datos Semilla si está vacía la tabla
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Insertando usuarios semilla...');
      await connection.query(`
        INSERT INTO users (id, username, password, role, points) VALUES
        (1, 'alejandro', 'admin123', 'admin', 0),
        (2, 'luis', 'luis123', 'colaborador', 0),
        (3, 'maria', 'maria123', 'colaborador', 0),
        (4, 'jose', 'jose123', 'colaborador', 0);
      `);
    }

    const [tasks] = await connection.query('SELECT COUNT(*) as count FROM tasks');
    if (tasks[0].count === 0) {
      console.log('Insertando tareas semilla...');
      await connection.query(`
        INSERT INTO tasks (id, title, description, assigned_to, status, total_duration_ms, time_limit_minutes, is_extra, complexity) VALUES
        (1, 'Analisis de Estructura de Seguridad', 'Analizar la seguridad y control de acceso', 2, 'Pending', 0, 60, FALSE, 'Media'),
        (2, 'Diseñar diagramas de BD', 'Generar scripts SQL y relaciones', 3, 'Pending', 0, 45, FALSE, 'Simple'),
        (3, 'Configurar servidor Express', 'Inicializar ruteo basico y sesiones', 4, 'Pending', 0, 30, FALSE, 'Simple');
      `);
    }

    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = initializeDatabase;
