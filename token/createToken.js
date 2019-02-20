const jwt = require('jsonwebtoken');
module.exports = function(username){
  const token = jwt.sign({username: username}, 'cq', {expiresIn: '60s'});
  return token;
};