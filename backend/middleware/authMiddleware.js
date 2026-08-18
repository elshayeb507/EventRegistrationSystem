const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = appError.create('No token provided, access denied', 401, httpStatus.FAIL);
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const error = appError.create('Invalid or expired token', 401, httpStatus.FAIL);
    return next(error);
  }
};

const organizerOnly = (req, res, next) => {
  if (req.user.role !== 'organizer') {
    const error = appError.create('Access denied: organizers only', 403, httpStatus.FAIL);
    return next(error);
  }
  next();
};

module.exports = { protect, organizerOnly };