const { User } = require('../models/User');
const { generateToken } = require('../utils/jwt');

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).populate('employee');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employee ? user.employee._id.toString() : null,
      isFirstLogin: user.isFirstLogin,
    },
  };
};

/**
 * Register a new user (e.g. HR or Manager).
 * In a real system, this should be restricted (e.g. HR-only),
 * but for this demo we keep it open.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
  });

  const token = generateToken({ id: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: null,
    },
  };
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  // Assign plain text — the pre-save hook will hash it
  user.password = newPassword;
  user.isFirstLogin = false;
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  login,
  register,
  changePassword,
};

