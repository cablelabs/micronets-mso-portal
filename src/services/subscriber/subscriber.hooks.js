const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      hook => {
        return hook.app.service('internal/subscriber').find({ query: { id: hook.id } })
          .then( ({ data }) => {
            console.log('\n Subscriber found  raw : ' + JSON.stringify(data));
            hook.result = omitMeta(data[0]);
            console.log('\n hook.result found after processing : ' + JSON.stringify(hook.result))
          });
      }
    ],
    create: [],
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
