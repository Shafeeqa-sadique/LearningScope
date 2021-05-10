let jwt       = require('jsonwebtoken');
const config  = require('./config.js');

let checkToken = (req, res, next, callback) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return callback({success:false, message:'Token is not valid or expired'});
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return callback({success:false, message:'Auth token is not supplied'});
  }
};

module.exports = {
  checkToken: checkToken
}