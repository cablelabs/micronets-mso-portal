const users = require('./users/users.service.js');
const ca = require('./ca/ca.service.js');
const certificates = require('./certificates/certificates.service.js');
const key = require('./key/key.service.js');
const subscriber = require('./subscriber/subscriber.service.js');
const session = require('./session/session.service.js');
const token = require('./token/token.service.js');

const authorize = require('./authorize/authorize.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(token);
  app.configure(users);
  app.configure(ca);
  app.configure(certificates);
  app.configure(key);
  app.configure(subscriber);
  app.configure(session);
  app.configure(authorize);
};
