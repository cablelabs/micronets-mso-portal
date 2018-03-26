// Initializes the `session` service on path `/portal/session`
const createService = require('feathers-mongoose');
const createModel = require('../../models/session.model');
const hooks = require('./session.hooks');
const filters = require('./session.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'session',
    Model,
    paginate,
    id:'id'
  };

  // Initialize our service with any options it requires
  app.use('/portal/session', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portal/session');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
