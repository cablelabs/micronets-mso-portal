const token = require('./token/token.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(token);
};
