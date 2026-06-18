const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middlewares/authMiddleware');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(helmet()); // Configura cabeceras de seguridad
app.disable('x-powered-by'); // Oculta Express (aunque helmet ya lo hace, se cumple con la tarea explícitamente)

app.use(express.json()); // Parseo de JSON

// Rutas
app.use('/api/auth', authRoutes);

// Ejemplo de ruta protegida
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Ruta protegida accedida con éxito', user: req.user });
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
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
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const tareasRoutes = require('./routes/tareas');
const initializeDatabase = require('./db/dbSetup');
const path = require('path');
require('dotenv').config();

// Importar el enrutador de login
const routes = require('./routes/login');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'dinamita_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Servir archivos estáticos del frontend (carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', loginRoutes);
app.use('/api/tasks', tareasRoutes);

// Redirigir la raíz al login
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin.html');
    }
    return res.redirect('/colaborador.html');
  }
  res.redirect('/login.html');
});

// Inicializar BD y arrancar servidor
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`Servidor Dinamita corriendo en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}).catch(err => {
  console.error('No se pudo inicializar la base de datos.', err);
// Middleware para procesar cuerpos de petición en formato JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta 'public' de forma estática
app.use(express.static(path.join(__dirname, 'public')));

// Montar el enrutador bajo el prefijo '/api'
app.use('/api', routes);

// Redirigir la ruta raíz al formulario de login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Usuario admin de prueba: admin@tareas.com / Password123`);
// Levantar el servidor local
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor de pruebas iniciado con éxito`);
  console.log(` URL de Login: http://localhost:${PORT}/login.html`);
  console.log(`===================================================`);
});
