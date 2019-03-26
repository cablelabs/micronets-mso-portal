// Initializes the `users` service on path `/users`
const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'id',
    name: 'users',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/portal/v1/users', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('/portal/v1/users');

  service.hooks(hooks);
};
