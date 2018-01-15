// Initializes the `ca` service on path `/ca/csrt`
const createService = require('feathers-mongoose');
const createModel = require('../../models/ca.model');
const hooks = require('./ca.hooks');
const filters = require('./ca.filters');

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
  app.use('/ca/csrt', createService(options));
  // Get our initialized service so that we can register hooks and filters
  const service = app.service('ca/csrt');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
