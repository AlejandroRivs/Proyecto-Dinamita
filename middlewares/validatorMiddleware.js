const { body, validationResult } = require('express-validator');

const registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('El usuario es obligatorio')
        .escape(),
    body('email')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    validate
};
