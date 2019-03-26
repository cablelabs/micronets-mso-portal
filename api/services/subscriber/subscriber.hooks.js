const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const axios = require ( 'axios' );
const mongoose = require('mongoose');
var ip = require("ip");
const app = require ( './../../app' );
const logger = require ( './../../logger' );
let allHeaders = { crossDomain: true, headers : {  'Content-type': 'application/json' } };
const errors = require('@feathersjs/errors');

module.exports = {
  before: {
    all : [] ,
    find: [],
    get: [
      hook => {
        return hook.app.service('/portal/v1/subscriber').find({ query: { id: hook.id } })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
          });
      }
    ],
    create: [
      async(hook) => {
      hook.params.mongoose = {
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true
        }
        const { data, params}  = hook
        const subscriber = await hook.app.service('/portal/v1/subscriber').get(hook.data.id)
        logger.debug('Obtained subscriber : ' + JSON.stringify(subscriber))
        if(subscriber.hasOwnProperty('id') && subscriber.id == hook.data.id) {
          return Promise.reject(new errors.Conflict(new Error(' Subscriber already exists!! ')))
        }
      }
    ],
    update: [
      async(hook) => {
        const { data, params, id}  = hook
        console.log('\n Before update hook data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params) + '\t\t id : ' + JSON.stringify(id))
        const oldSubscriber = await hook.app.service('/portal/v1/subscriber').get(hook.id)
        console.log('\n OLD Subscriber before update : ' + JSON.stringify(oldSubscriber))
        hook.params.oldSubscriber = Object.assign({},oldSubscriber)
    }
    ],
    patch: [
      async(hook) => {
        const { data, params, id}  = hook
        console.log('\n Before patch hook data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params) + '\t\t id : ' + JSON.stringify(id))
        const oldSubscriber = await hook.app.service('/portal/v1/subscriber').get(hook.id)
        console.log('\n OLD Subscriber before patch : ' + JSON.stringify(oldSubscriber))
        hook.params.oldSubscriber = Object.assign({},oldSubscriber)
      }
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (hook) => {
        const { params  , payload } = hook;

        //  Create web socket url for associated subscriber
        let webSocketBaseUrl = hook.app.get('webSocketBaseUrl')
        logger.debug('\n Web socket base url from config : ' + JSON.stringify(webSocketBaseUrl))
        const postSocket = Object.assign({},{
          socketUrl: `${webSocketBaseUrl}/${hook.result.id}-${hook.result.gatewayId}`,
          subscriberId: hook.result.id,
          gatewayId:hook.result.gatewayId
        })
        await hook.app.service('/portal/v1/socket').create(postSocket,allHeaders)
        const socket  = await hook.app.service('/portal/v1/socket').get(hook.result.id)
        logger.debug('\n Retrieved  socket  : ' + JSON.stringify(socket))

        // Create Registry for subscriber
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const postRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          webSocketUrl: socket.socketUrl,
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
        await hook.app.service ( '/portal/v1/users').create(user, allHeaders)


        return hook;
      }
    ],
    update: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber } = params
        console.log('\n After Update subscriber hook oldSubscriber : ' + JSON.stringify(oldSubscriber))
        console.log('\n\n After Update subscriber hook params : ' + JSON.stringify(params) + '\t\t Payload : ' + JSON.stringify(payload) + '\t\t ID : ' + JSON.stringify(id))
        // Update socket url for associated subscriber
        let webSocketBaseUrl = hook.app.get('webSocketBaseUrl')
        logger.debug('\n Web socket base url from config : ' + JSON.stringify(webSocketBaseUrl))
        const putSocket = Object.assign({},{
          socketUrl: `${webSocketBaseUrl}/${hook.result.id}-${hook.result.gatewayId}`,
          subscriberId: hook.result.id,
          gatewayId:hook.result.gatewayId
        })

        const oldSocket  = await hook.app.service('/portal/v1/socket').get(oldSubscriber.id)
        logger.debug('\n Retrieved oldSocket  : ' + JSON.stringify(oldSocket))

        const socket = await hook.app.service('/portal/v1/socket').update(oldSubscriber.id,{...putSocket},allHeaders)

        // Updated associated Registry
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const putRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          webSocketUrl: socket.socketUrl,
          gatewayId: hook.result.gatewayId
        })
        const registryRes = await axios.put ( `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}` , {...putRegistry} , allHeaders );

      }
    ],
    patch: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber } = params
        // Patch socket url for associated subscriber
        let webSocketBaseUrl = hook.app.get('webSocketBaseUrl')
        logger.debug('\n Web socket base url from config : ' + JSON.stringify(webSocketBaseUrl))
        console.log('\n After patch subscriber hook oldSubscriber : ' + JSON.stringify(oldSubscriber))
        console.log('\n\n After patch subscriber hook params : ' + JSON.stringify(params) + '\t\t Payload : ' + JSON.stringify(payload) + '\t\t ID : ' + JSON.stringify(id))

        const patchSocket = Object.assign({},{
          socketUrl: `${webSocketBaseUrl}/${hook.result.id}-${hook.result.gatewayId}`,
          subscriberId: hook.result.id,
          gatewayId:hook.result.gatewayId
        })
        await hook.app.service('/portal/v1/socket').patch(oldSubscriber.id,{...patchSocket},allHeaders)

        const socket  = await hook.app.service('/portal/v1/socket').get(hook.result.id)
        logger.debug('\n Retrieved  socket  : ' + JSON.stringify(socket))

        // Updated associated Registry
        let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
        const patchRegistry = Object.assign({},{
          subscriberId: hook.result.id,
          mmUrl: hook.result.registry,
          mmClientUrl: `http://${mmBaseUrl}:8080`,
          msoPortalUrl: `http://${ip.address()}:3210`,
          webSocketUrl: socket.socketUrl,
          gatewayId: hook.result.gatewayId
        })
        const registryRes = await axios.patch ( `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}` , {...patchRegistry} , allHeaders );


      }
    ],
    remove: [
      async(hook) => {
        const { data, params, id } = hook
        console.log('\n After delete hook id : ' + JSON.stringify(id))
        console.log('\n After delete hook result : ' + JSON.stringify(hook.result))
        if(id) {
          await hook.app.service('/portal/v1/socket').remove(id,allHeaders)
          await hook.app.service('/portal/v1/users').remove(id,allHeaders)
        }
        else {
          await hook.app.service('/portal/v1/socket').remove(null,allHeaders)
          await hook.app.service('/portal/v1/users').remove(null,allHeaders)
        }
      }
    ]
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
