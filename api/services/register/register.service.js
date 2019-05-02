// Initializes the `register` service on path `/portal/v1/register`
const createService = require('feathers-mongoose');
const createModel = require('../../models/register.model');
const hooks = require('./register.hooks');
const paths = require('./../../hooks/servicePaths')
const servicePath = paths.REGISTER_PATH
module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'subscriberId',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use(`${servicePath}`, createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service(`${servicePath}`);
  service.hooks(hooks);
};
