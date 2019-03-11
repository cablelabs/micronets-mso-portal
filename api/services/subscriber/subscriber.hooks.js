const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const axios = require ( 'axios' );
const mongoose = require('mongoose');
var ip = require("ip");
let allHeaders = { crossDomain: true, headers : {  'Content-type': 'application/json' } };
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
    update: [],
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

        // Create Registry for subscriber
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const postRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          gatewayId: hook.result.gatewayId
        })
        const registryRes = await axios.post ( `${hook.result.registry}/mm/v1/micronets/registry` , {...postRegistry} , allHeaders );

        // Create User for associated subscriber
          const user = Object.assign({},{
            id: hook.result.id,
            ssid: hook.result.ssid,
            name: hook.result.name,
            mmUrl: `http://${mmBaseUrl}:8080`
          })
        await hook.app.service ( '/portal/users').create(user, allHeaders)
        return hook;
      }
    ],
    update: [
      async(hook) => {
        const { params  , payload } = hook;
        // Updated associated Registry
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const putRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          gatewayId: hook.result.gatewayId
        })
        const registryRes = await axios.put ( `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}` , {...putRegistry} , allHeaders );
      }
    ],
    patch: [
      async(hook) => {
        const { params  , payload } = hook;
        // Updated associated Registry
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const patchRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          gatewayId: hook.result.gatewayId
        })
        const registryRes = await axios.patch ( `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}` , {...patchRegistry} , allHeaders );
      }
    ],
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
