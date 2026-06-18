const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'root'
};

let pool;

async function initDb() {
  // 1. Connect to MySQL server without database first to ensure the database exists
  const connection = await mysql.createConnection(config);
  await connection.query('CREATE DATABASE IF NOT EXISTS todo_list_db;');
  await connection.end();

  // 2. Create the connection pool with the database specified
  pool = mysql.createPool({
    ...config,
    database: 'todo_list_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // 3. Create tables
  const createCollaboratorsTable = `
    CREATE TABLE IF NOT EXISTS collaborators (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
  `;

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      collaborator_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaborator_id) REFERENCES collaborators(id) ON DELETE CASCADE
    );
  `;

  await pool.query(createCollaboratorsTable);
  await pool.query(createTasksTable);

  // 4. Seed collaborators if none exist
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM collaborators');
  if (rows[0].count === 0) {
    const seedQuery = 'INSERT INTO collaborators (name) VALUES (?), (?), (?), (?)';
    await pool.query(seedQuery, ['Alice', 'Bob', 'Charlie', 'Diana']);
    console.log('Database seeded with default collaborators.');
  }

  console.log('Database and tables initialized successfully.');
}

async function getCollaborators() {
  const [rows] = await pool.query('SELECT * FROM collaborators ORDER BY name ASC');
  return rows;
}

async function getTasks(collaboratorId = null) {
  let query = 'SELECT t.*, c.name as collaborator_name FROM tasks t LEFT JOIN collaborators c ON t.collaborator_id = c.id';
  const params = [];
  
  if (collaboratorId) {
    query += ' WHERE t.collaborator_id = ?';
    params.push(collaboratorId);
  }
  
  query += ' ORDER BY t.created_at DESC';
  const [rows] = await pool.query(query, params);
  return rows;
}

async function createTask(title, description, collaboratorId) {
  const query = 'INSERT INTO tasks (title, description, collaborator_id) VALUES (?, ?, ?)';
  const [result] = await pool.query(query, [title, description, collaboratorId]);
  return { id: result.insertId, title, description, collaborator_id: collaboratorId };
}

async function deleteTask(id) {
  const query = 'DELETE FROM tasks WHERE id = ?';
  const [result] = await pool.query(query, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  initDb,
  getCollaborators,
  getTasks,
  createTask,
  deleteTask
};
