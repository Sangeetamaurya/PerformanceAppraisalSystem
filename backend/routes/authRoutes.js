const express = require('express');
const { loginController, registerController } = require('../controllers/authController');

const router = express.Router();

// Public authentication routes
router.post('/login', loginController);
router.post('/register', registerController);

module.exports = router;

