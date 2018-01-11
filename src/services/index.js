const users = require('./users/users.service.js');
const subscribers = require('./subscribers/subscribers.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(subscribers);
};
