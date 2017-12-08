// Initializes the `token` service on path `/portal/token`
const createService = require('feathers-mongodb');
const hooks = require('./token.hooks');
const filters = require('./token.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/portal/token', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portal/token');

  mongoClient.then(db => {
    service.Model = db.collection('token');
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
