// Initializes the `subscriber` service on path `/internal/subscriber`
const createService = require('feathers-mongoose');
const createModel = require('../../models/subscriber.model');
const hooks = require('./subscriber.hooks');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'id',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('portal/v1/subscriber', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portal/v1/subscriber');

  service.hooks(hooks);
};
