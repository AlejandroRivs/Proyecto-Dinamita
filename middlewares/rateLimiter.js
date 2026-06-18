const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limitar cada IP a 5 solicitudes por ventana
    message: { message: "Demasiados intentos, por favor intente más tarde." },
    standardHeaders: true, // Retornar información sobre el límite en las cabeceras `RateLimit-*`
    legacyHeaders: false, // Deshabilitar cabeceras `X-RateLimit-*`
});

module.exports = authLimiter;
