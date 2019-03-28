// Initializes the `certificates` service on path `/ca/cert`
const createService = require('feathers-mongoose');
const createModel = require('../../models/certificates.model');
const hooks = require('./certificates.hooks');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    id:'subscriber.id',
    name: 'certificates',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('portal/v1/ca/cert', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('portal/v1/ca/cert');

  service.on('created', (service, context) => {});

  service.on('certGenerated', (data)=> {})

  service.hooks(hooks);
};
