const express = require('express');
const { loginController, registerController, changePasswordController } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public authentication routes
router.post('/login', loginController);
router.post('/register', registerController);

// Protected: any authenticated user can change their own password
router.post('/change-password', authMiddleware, changePasswordController);

module.exports = router;

