const { authenticate } = require('feathers-authentication').hooks;
const omit = require('ramda/src/omit');
module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
      hook => {
        const { data } = hook;
        const omitSubscriberMeta = omit(['updatedAt', 'createdAt', '_id', '__v'])
        return hook.app.service('subscribers').find({ query: { id: hook.data.id } })
          .then( ({ data }) => {
            data = data [0];
            hook.result = Object.assign({} , { subscriber :  omitSubscriberMeta(data)  } );
            hook.result = Object.assign( hook.result, { wifiCert : 'Loreum Ispum Wifi Cert' , caCert :'Loreum Ispum ca Cert'});
          });
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
