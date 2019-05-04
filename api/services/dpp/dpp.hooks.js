const { authenticate } = require('@feathersjs/authentication').hooks;
const logger = require ( './../../logger' );
module.exports = {
  before: {
    all : [],
    // all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
      async(hook) => {
        const {data, params, id, headers} = hook
        const { requestHeaders, requestUrl } = params
        logger.debug('\n\n Data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params))

      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
