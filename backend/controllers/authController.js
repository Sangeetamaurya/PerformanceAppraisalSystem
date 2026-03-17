const { login, register, changePassword } = require('../services/authService');
const { USER_ROLES } = require('../models/User');

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const result = await login({ email, password });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const registerController = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${USER_ROLES.join(', ')}` });
    }
    const result = await register({ name, email, password, role });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
};

const changePasswordController = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    const result = await changePassword({ userId: req.user.id, currentPassword, newPassword });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  loginController,
  registerController,
  changePasswordController,
};

