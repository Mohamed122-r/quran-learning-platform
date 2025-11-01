const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(' ')[1];

      // التحقق من التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // الحصول على بيانات المستخدم من التوكن
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالدخول، التوكن غير صالح'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح بالدخول، لا يوجد توكن'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'غير مصرح بالدخول، تحتاج صلاحيات مدير'
    });
  }
};

const teacher = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'غير مصرح بالدخول، تحتاج صلاحيات معلم'
    });
  }
};

module.exports = { protect, admin, teacher };
