const { authenticate } = require('feathers-authentication').hooks;
const  { findIndex, propEq, find, lensPath, view, set } = require('ramda');
const omit = require('ramda/src/omit');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
      hook => {
        const { params , data , payload } = hook;
        const jwtToken = params.headers.authorization.split(' ')[1];
        const omitSubscriberMeta = omit(['updatedAt', 'createdAt', '_id', '__v'])
        let resultCsr = {
          csrTemplate: {
            keyType:'RSA:2048'
          },
          debug : {
            context : {
              token : jwtToken ,
              clientID : params.payload.clientID ,
              deviceID : params.payload.deviceID ,
              timestamp : params.payload.iat
            }
          }
        };
        return hook.app.service('subscribers').find({ query: { id: hook.data.subscriberID } })
          .then( ({ data }) => {
            data = data [0];
            const { debug : { context : { subscriber } } } = csrTemplate;
            hook.result = Object.assign(resultCsr , { subscriber :  omitSubscriberMeta(data) || {}  } );
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
