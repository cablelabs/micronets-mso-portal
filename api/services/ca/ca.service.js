// Initializes the `ca` service on path `/ca/csrt`
const createService = require('feathers-mongoose');
const createModel = require('../../models/ca.model');
const hooks = require('./ca.hooks');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'ca',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('portal/v1/ca/csrt', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portal/v1/ca/csrt');

  service.hooks(hooks);
};
