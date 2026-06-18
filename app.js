const express = require('express');
const path = require('path');
require('dotenv').config();

// Importar el enrutador de login
const routes = require('./routes/login');

const app = express();
const PORT = process.env.PORT || 3000;

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
