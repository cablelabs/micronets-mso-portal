var jwt = require('jsonwebtoken');
const logger = require ( './../logger' );
module.exports = function (data, connection, hook) { // eslint-disable-line no-unused-vars
  const { secret } = hook.app.get('authentication')
  logger.debug('\n Generated JWT Token Passed : ' + JSON.stringify(hook.data) + '\t\t secret : ' + JSON.stringify(secret));
  const token = jwt.sign(hook.data, secret );
  logger.debug('\n Generated JWT Token : ' + JSON.stringify(token));
  return token;

};
