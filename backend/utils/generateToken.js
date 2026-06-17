const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token.
 * @param {string} id   - MongoDB document _id
 * @param {string} role - 'user' | 'admin' | 'superadmin'
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
