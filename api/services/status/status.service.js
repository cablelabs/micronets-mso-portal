// Initializes the `status` service on path `/onboarding/dpp/status`
const createService = require('feathers-mongoose');
const createModel = require('../../models/status.model');
const hooks = require('./status.hooks');
const servicePath = require('./../../hooks/servicePaths').MSO_STATUS_PATH
module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'deviceId',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use(`${servicePath}`, createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service(`${servicePath}`);
  service.hooks(hooks);
  app.use ( `${servicePath}/:id`, service  );
};
