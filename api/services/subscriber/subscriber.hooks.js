const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const axios = require ( 'axios' );
const mongoose = require('mongoose');

module.exports = {
  before: {
    all : [ authenticate ( 'jwt' ) ] ,
    find: [],
    get: [
      hook => {
        return hook.app.service('/internal/subscriber').find({ query: { id: hook.id } })
          .then( ({ data }) => {
            console.log('\n Subscriber found  raw : ' + JSON.stringify(data));
            hook.result = omitMeta(data[0]);
            console.log('\n hook.result found after processing : ' + JSON.stringify(hook.result));
          });
      }
    ],
    create: [
      hook => {
        console.log('\n Before create hook for subscriber');
      }
    ],
    update: [
      async (hook) =>  {
        const { params  , payload, data, id } = hook;
        hook.params.mongoose = {
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true
        }
        console.log('\n PUT REQUEST FOR SUBSCRIBER WITH DATA : ' + JSON.stringify(data) + '\t\t PARAMS : ' + JSON.stringify(params) + '\t\t ID : ' + JSON.stringify(id))
        let subscriber = await hook.app.service ( 'internal/subscriber' ).find ( { query : { id : id }, mongoose: { upsert: true}} )
        subscriber = subscriber.data[0]
        console.log('\n Subscriber found  raw : ' + JSON.stringify(data));
        const originalSubscriber = subscriber;
        console.log('\n Original Subscriber : ' + JSON.stringify(originalSubscriber))
        let updatedSubscriber = Object.assign ( {}, {...originalSubscriber , ...hook.data});
        console.log('\n Updated Subscriber : ' + JSON.stringify(updatedSubscriber))
        const patchResult = await hook.app.service('/internal/subscriber').patch(null, updatedSubscriber,{ query : { id: id }, mongoose: { upsert: true}})
        hook.result =  patchResult[0]
        console.log('\n Hook.data : ' + JSON.stringify(hook.result))
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
        const { headers: { authorization }} = params
        const jwtToken = authorization.split(' ')[1]
        console.log('\n params.headers.authorization : ' + JSON.stringify(params.headers.authorization))
        console.log('\n JWT Token : ' + JSON.stringify(jwtToken))
        let allHeaders = { crossDomain: true, headers : { 'Authorization' : params.headers.authorization  , 'Content-type': 'application/json' } };
        console.log('\n All Headers : ' + JSON.stringify(allHeaders))
        console.log('\n After create hook for subscriber Params : ' + JSON.stringify(params) + '\t\t\t Payload : ' + JSON.stringify(payload))
        console.log('\n After create hook for subscriber hook.data : ' + JSON.stringify(hook.data) + '\t\t\t hook.result : ' + JSON.stringify(hook.result));
        console.log('\n Registry get url : ' + JSON.stringify(`${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}`))
        // let registry = await axios.get ( `${hook.result.registry}/micronets/v1/mm/registry/${hook.result.id}`, allHeaders )
        axios({
          ...allHeaders,
          method: 'get',
          url: `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}`
        }).then((response) => {
          console.log('\n Registry url response : ' + JSON.stringify(response.data))
          const user = Object.assign({},{
            id: hook.result.id,
            ssid: hook.result.ssid,
            name: hook.result.name,
            mmUrl: response.data.mmClientUrl
          })
          console.log('\n User to create : ' + JSON.stringify(user))
          return hook.app.service ( '/portal/users').create(user , allHeaders )
        })
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
