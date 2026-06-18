const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');

// All user routes require admin role
router.use(AuthController.verifySession, AuthController.verifyAdmin);

router.get('/', UserController.getUsers);
router.post('/create', UserController.createUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
