const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/register number and password.'
      });
    }

    const cleanInput = username.trim().toLowerCase();
    const cleanUpper = username.trim().toUpperCase();

    // Look up by username or registerNumber
    const user = await User.findOne({
      $or: [
        { username: cleanInput },
        { registerNumber: cleanUpper }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact the administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
        registerNumber: user.registerNumber || null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    // If student, check if student profile exists
    let studentId = null;
    if (user.role === 'student' && user.registerNumber) {
      const studentProfile = await Student.findOne({ registerNumber: user.registerNumber });
      if (studentProfile) {
        studentId = studentProfile._id;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        role: user.role,
        registerNumber: user.registerNumber,
        studentId
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    let studentId = null;

    if (user.role === 'student' && user.registerNumber) {
      const studentProfile = await Student.findOne({ registerNumber: user.registerNumber });
      if (studentProfile) {
        studentId = studentProfile._id;
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || user.username,
        role: user.role,
        registerNumber: user.registerNumber,
        studentId
      }
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user details'
    });
  }
};
