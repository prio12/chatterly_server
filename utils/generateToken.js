//dependencies (external imports)
const jwt = require('jsonwebtoken');

//generating jwt token
function generateToken(userUid) {
  return jwt.sign({ uid: userUid }, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d',
  });
}

module.exports = generateToken;
