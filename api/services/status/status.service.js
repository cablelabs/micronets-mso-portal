// Initializes the `status` service on path `/onboarding/dpp/status`
const createService = require('feathers-mongoose');
const createModel = require('../../models/status.model');
const hooks = require('./status.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'subscriberId',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/portal/v1/status', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('/portal/v1/status');
  service.hooks(hooks);
};
