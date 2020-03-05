// Initializes the `devices` service on path `/devices`
const createService = require('feathers-mongoose');
const createModel = require('../../models/devices.model');
const hooks = require('./devices.hooks');
const paths = require('./../../hooks/servicePaths')
const servicePath = paths.DEVICES_PATH
module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'id',
    name: 'devices',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use(`${servicePath}`, createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service(`${servicePath}`);

  service.hooks(hooks);
};
