const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const axios = require ( 'axios' );
const mongoose = require('mongoose');

module.exports = {
  before: {
    all : [ //authenticate ( 'jwt' )
       ] ,
    find: [],
    get: [
      hook => {
        return hook.app.service('/internal/subscriber').find({ query: { id: hook.id } })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
          });
      }
    ],
    create: [],
    update: [
      async (hook) =>  {
        const { params  , payload, data, id } = hook;
        hook.params.mongoose = {
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true
        }
        let subscriber = await hook.app.service ( 'internal/subscriber' ).find ( { query : { id : id }, mongoose: { upsert: true}} )
        subscriber = subscriber.data[0]
        const originalSubscriber = subscriber;
        let updatedSubscriber = Object.assign ( {}, {...originalSubscriber , ...hook.data});
        const patchResult = await hook.app.service('/internal/subscriber').patch(null, updatedSubscriber,{ query : { id: id }, mongoose: { upsert: true}})
        hook.result =  patchResult[0]
        return Promise.resolve(hook)
      }
    ],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (hook) => {
        const { params  , payload } = hook;
        // const { headers: { authorization }} = params
        // const jwtToken = authorization.split(' ')[1]
        // let allHeaders = { crossDomain: true, headers : { 'Authorization' : params.headers.authorization  , 'Content-type': 'application/json' } };
        // let allHeaders = { crossDomain: true, headers : {  'Content-type': 'application/json' } };
        // // let registry = await axios.get ( `${hook.result.registry}/micronets/v1/mm/registry/${hook.result.id}`, allHeaders )
        // axios({
        //   ...allHeaders,
        //   method: 'get',
        //   url: `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}`
        // }).then((response) => {
        //   const user = Object.assign({},{
        //     id: hook.result.id,
        //     ssid: hook.result.ssid,
        //     name: hook.result.name,
        //     mmUrl: response.data.mmClientUrl
        //   })
        //   return hook.app.service ( '/portal/users').create(user , allHeaders )
        // })
        // return hook;
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
