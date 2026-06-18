const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await hashPassword(password);

        // Insertar en la base de datos (con consultas preparadas)
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por email
        const [users] = await db.execute('SELECT id, username, password, role FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Comparar contraseña
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar JWT
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role || 'user'
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.json({
            message: 'Login exitoso',
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    register,
    login
};
