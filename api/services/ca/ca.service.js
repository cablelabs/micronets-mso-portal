// Initializes the `ca` service on path `/ca/csrt`
const createService = require('feathers-mongoose');
const createModel = require('../../models/ca.model');
const hooks = require('./ca.hooks');
const paths = require('./../../hooks/servicePaths')
const servicePath = paths.CSRT_PATH
module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use(`${servicePath}`, createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service(`${servicePath}`);
  service.hooks(hooks);
};
