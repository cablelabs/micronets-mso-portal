// Initializes the `socket` service on path `/portal/v1/socket`
const createService = require('feathers-mongoose');
const createModel = require('../../models/socket.model');
const hooks = require('./socket.hooks');
const paths = require('./../../hooks/servicePaths')
const servicePath = paths.SOCKET_PATH

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
