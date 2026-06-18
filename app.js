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

// Levantar el servidor local
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor de pruebas iniciado con éxito`);
  console.log(` URL de Login: http://localhost:${PORT}/login.html`);
  console.log(`===================================================`);
});
