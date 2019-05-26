const devices = require('./devices/devices.service.js');
const ca = require('./ca/ca.service.js');
const certificates = require('./certificates/certificates.service.js');
const key = require('./key/key.service.js');
const subscriber = require('./subscriber/subscriber.service.js');
const token = require('./token/token.service.js');
const authorize = require('./authorize/authorize.service.js');
const socket = require('./socket/socket.service.js');
const register = require('./register/register.service.js');
const dpp = require('./dpp/dpp.service.js');
const users = require('./users/users.service.js');
const onboarding = require('./onboarding/onboarding.service.js');

const status = require('./status/status.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(token);
  app.configure(devices);
  app.configure(ca);
  app.configure(certificates);
  app.configure(key);
  app.configure(subscriber);
  app.configure(authorize);
  app.configure(socket);
  app.configure(register);
  app.configure(dpp);
  app.configure(users);
  app.configure(onboarding);
  app.configure(status);
};
