// ============================================================
// db/conexion.js - Conexión a la base de datos MySQL
// Crea un pool de conexiones reutilizables con mysql2
// ============================================================

const mysql = require('mysql2/promise');

// Pool de conexiones: en vez de abrir y cerrar una conexión por petición,
// se mantiene un grupo de conexiones listas para usar (más eficiente)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
  database: process.env.DB_NAME || 'gestion_tareas',
  port: process.env.DB_PORT || 3306,
 
});

// Verificar que la conexión funciona al arrancar el servidor
pool.getConnection()
  .then(conexion => {
    console.log(' Conexión a MySQL establecida correctamente');
    conexion.release(); // Devolver la conexión al pool
  })
  .catch(error => {
    console.error(' Error al conectar con MySQL:', error.message);
    process.exit(1); // Detener el servidor si no puede conectar a la BD
  });

// Exportar el pool para usarlo en los modelos
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'MYsqlPLUS',
  database: process.env.DB_NAME || 'dynamite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
