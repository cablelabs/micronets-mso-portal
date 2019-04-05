const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const logger = require ( './../../logger' );

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      async(hook) => {
        const { data, params , result , id} = hook
        hook.result = hook.result.data.length ==1 ? omitMeta(hook.result.data[0]): hook.result.data.map((data) => { return omitMeta(data)})
        return Promise.resolve(hook)
      }
    ],
    get: [
      async(hook) => {
        const { data, params , result , id} = hook
        hook.result =  omitMeta(hook.result)
        return Promise.resolve(hook)
      }
    ],
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
