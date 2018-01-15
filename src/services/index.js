const users = require('./users/users.service.js');
const subscribers = require('./subscribers/subscribers.service.js');

const ca = require('./ca/ca.service.js');

const certificates = require('./certificates/certificates.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(subscribers);
  app.configure(ca);
  app.configure(certificates);
};
