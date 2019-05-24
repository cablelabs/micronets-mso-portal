// Initializes the `users` service on path `/portal/v1/users`
const createService = require('feathers-mongoose');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const paths = require('./../../hooks/servicePaths')
const servicePath = paths.USERS_PATH
// const logger = require ( './../../logger' );
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
  app.use ( `${servicePath}/login`, service  );
  app.use ( `${servicePath}/logout`, service  );
  app.use ( `${servicePath}/session`, service  );

};
