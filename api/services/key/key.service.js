// Initializes the `key` service on path `/key`
const createService = require('feathers-mongoose');
const createModel = require('../../models/key.model');
const hooks = require('./key.hooks');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'key',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/portal/key', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('/portal/key');

  service.hooks(hooks);
};
