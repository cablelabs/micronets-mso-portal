const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      hook => {
        return hook.app.service('/portal/users').find({ query: { id: hook.id } })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
            console.log('\n hook.result  : ' + JSON.stringify(hook.result));
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
    create: [
      hook => {
        hook.result = omitMeta(hook.result);
        console.log('\n Users service hook.result : ' + JSON.stringify(hook.result))
        return hook;
      }
    ],
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
