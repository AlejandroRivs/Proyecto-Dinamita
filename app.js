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
