// ============================================================
// app.js - Punto de entrada principal del servidor
// Configura Express, sesiones, rutas y arranca el servidor
// ============================================================

const express       = require('express');
const session       = require('express-session');
const path          = require('path');
require('dotenv').config(); // Cargar variables de entorno desde .env

const authRoutes    = require('./routes/authRoutes');
const tareaRoutes   = require('./routes/tareaRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────
// Permite leer JSON en el cuerpo de las peticiones
app.use(express.json());

// Permite leer datos enviados desde formularios HTML
app.use(express.urlencoded({ extended: false }));

// Sirve los archivos estáticos (HTML, CSS, imágenes) de la carpeta public/
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones del lado del servidor
// La sesión guarda quién está logueado sin usar JWT
app.use(session({
  secret:            process.env.SESSION_SECRET || 'clave_secreta_cambiar_en_produccion',
  resave:            false,  // No guardar sesión si no cambió nada
  saveUninitialized: false,  // No crear sesión hasta que haya datos
  cookie: {
    maxAge:   1000 * 60 * 60 * 2, // La sesión dura 2 horas
    httpOnly: true                 // La cookie no es accesible desde JS del cliente
  }
}));

// ── Rutas de la aplicación ────────────────────────────────────
app.use('/auth',   authRoutes);   // /auth/login, /auth/logout, /auth/me
app.use('/tareas', tareaRoutes);  // /tareas/, /tareas/crear, /tareas/estado, etc.

// Ruta raíz: redirige al login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Usuario admin de prueba: admin@tareas.com / Password123`);
});
