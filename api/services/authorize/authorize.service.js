// Initializes the `authorize` service on path `/authorize/subscribers`
const createService = require('feathers-mongoose');
const createModel = require('../../models/authorize.model');
const hooks = require('./authorize.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('portal/v1/authorize/subscribers', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('portal/v1/authorize/subscribers');

  service.hooks(hooks);
};
