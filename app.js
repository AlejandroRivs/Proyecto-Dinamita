const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

// Configuración de entorno
dotenv.config();

const initializeDatabase = require('./db/dbSetup');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"]
    },
  },
}));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'dinamita_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 día
    httpOnly: true
  }
}));

// API Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Redirección base
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
});

module.exports = app;
