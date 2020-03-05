// Initializes the `onboarding` service on path `/onboarding/dpp`
const createService = require('feathers-mongoose');
const createModel = require('../../models/onboarding.model');
const hooks = require('./onboarding.hooks');
const servicePath = require('./../../hooks/servicePaths').DPP_API_ONBOARD

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'subscriberId',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use(`${servicePath}`, createService(options));
  // Get our initialized service so that we can register hooks
  const service = app.service(`${servicePath}`);
  service.hooks(hooks);
};
