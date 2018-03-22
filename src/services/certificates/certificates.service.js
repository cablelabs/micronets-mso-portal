// Initializes the `certificates` service on path `/ca/cert`
const createService = require('feathers-mongoose');
const createModel = require('../../models/certificates.model');
const hooks = require('./certificates.hooks');
const filters = require('./certificates.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'certificates',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/ca/cert', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('ca/cert');

  service.on('created', (service, context) => {});

  service.on('certGenerated', (data)=> {
   // console.log('\n Certificates hooks event emitter certGenerated detected. Printing data : ' + JSON.stringify(data))
  })

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
