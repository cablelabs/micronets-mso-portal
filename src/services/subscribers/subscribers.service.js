// Initializes the `subscribers` service on path `/subscribers`
const createService = require('feathers-mongoose');
const createModel = require('../../models/subscribers.model');
const hooks = require('./subscribers.hooks');
const filters = require('./subscribers.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'subscribers',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/subscribers', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('subscribers');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
