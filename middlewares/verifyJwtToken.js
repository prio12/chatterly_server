const jwt = require('jsonwebtoken');

const verifyJwtToken = (req, res, next) => {
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  //verify token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Invalid or expired token',
      });
    }
    next();
  });
};

module.exports = verifyJwtToken;
