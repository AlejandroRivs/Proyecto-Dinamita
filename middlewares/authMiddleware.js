const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'No se proporcionó un token.' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(403).json({ message: 'Token mal formateado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'No autorizado. Token inválido o expirado.' });
        }
        req.user = decoded; // Guardar los datos del usuario en la request
        next();
    });
};

module.exports = verifyToken;
