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

const updateSwitchConfig = async(hook,oldSubscriber) => {
  const { data, params, method } = hook
  logger.debug('\n GatewayID updated . Update switch config for ' + JSON.stringify(`${oldSubscriber.registry}/mm/v1/micronets/odl/${oldSubscriber.gatewayId}`))
  const oldSwitchConfig = await axios({
    ...allHeaders,
    method: 'get',
    url: `${oldSubscriber.registry}/mm/v1/micronets/odl/${oldSubscriber.gatewayId}`
  })
  const postBodySwitchConfig = Object.assign({}, oldSwitchConfig.data, {"gatewayId": hook.result.gatewayId })
  logger.debug('\n\n Post switch config : ' + JSON.stringify(postBodySwitchConfig))
  await axios({
    ...allHeaders,
    method: 'delete',
    url: `${oldSubscriber.registry}/mm/v1/micronets/odl/${oldSubscriber.gatewayId}`
  })
  const updatedSwitchConfig = await axios({
    ...allHeaders,
    method: 'post',
    url: `${oldSubscriber.registry}/mm/v1/micronets/odl`,
    data: postBodySwitchConfig
  })
  logger.debug('\n\n New switch config : ' + JSON.stringify(updatedSwitchConfig.data))
  return updatedSwitchConfig
}

const updateSocket = async(hook,oldSubscriber) => {
  const { data, params, method } = hook
  let webSocketBaseUrl = hook.app.get('webSocketBaseUrl')
  logger.debug('\n Web socket base url from config : ' + JSON.stringify(webSocketBaseUrl) + '\t\t Method : ' + JSON.stringify(method))

  const oldSocket  = await hook.app.service('/portal/v1/socket').get(oldSubscriber.id)
  logger.debug('\n Retrieved oldSocket  : ' + JSON.stringify(oldSocket))

  const updateBody = Object.assign({},{
    socketUrl: `${webSocketBaseUrl}/${hook.result.id}-${hook.result.gatewayId}`,
    subscriberId: hook.result.id,
    gatewayId:hook.result.gatewayId
  })

  const socket = method == 'update' ? await hook.app.service('/portal/v1/socket').update(oldSubscriber.id,{...updateBody},allHeaders) :await hook.app.service('/portal/v1/socket').patch(oldSubscriber.id,{...updateBody},allHeaders)
  return socket
}

const updateRegistry = async(hook,oldSubscriber,socket) => {
  const { data, params, method } = hook
  let mmBaseUrl = hook.result.registry.split(':')[1].replace('//','')
  const updateBody = Object.assign({},{
    subscriberId: hook.result.id,
    mmUrl: hook.result.registry,
    mmClientUrl: `http://${mmBaseUrl}:8080`,
    msoPortalUrl: `http://${ip.address()}:3210`,
    webSocketUrl: socket.socketUrl,
    gatewayId: hook.result.gatewayId
  })
  const axiosReqType = method == 'update' ? 'put' : 'patch'

  const registry =  await axios({
    ...allHeaders,
    method: axiosReqType,
    url: `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}`,
    data: {...updateBody}
  })
  return registry
}

const updateMicronet = async(hook,oldSubscriber,result) => {
  const { data, params, method } = hook
  let mmBaseUrl = hook.result.registry
  const updateBody = Object.assign({},{
    ssid: hook.result.ssid,
    name: hook.result.name,
    gatewayId: hook.result.gatewayId
  })
  const micronet = await axios({
    ...allHeaders,
    method: 'PATCH',
    url: `${hook.result.registry}/mm/v1/subscriber/${oldSubscriber.id}`,
    data: {...updateBody}
  })

}

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
        const oldSubscriber = await hook.app.service('/portal/v1/subscriber').get(hook.id)
        hook.params.oldSubscriber = Object.assign({},oldSubscriber)
    }
    ],
    patch: [
      async(hook) => {
        const { data, params, id}  = hook
        const oldSubscriber = await hook.app.service('/portal/v1/subscriber').get(hook.id)
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
        hook.result = omitMeta(hook.result)
        return hook;
      }
    ],
    update: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber } = params

        // Cascading updates on changed Gateway ID
        if((hook.result.gatewayId != oldSubscriber.gatewayId) || (hook.result.ssid != oldSubscriber.ssid)) {
        // Update Gateway ID for switch config
        const switchConfig = await updateSwitchConfig(hook,oldSubscriber)

        // Update socket url for associated subscriber
        const socket = await updateSocket(hook,oldSubscriber)

        // Updated associated Registry
        const registry = await updateRegistry(hook,oldSubscriber,socket)

        // Updated associated Micronet
          const micronet = await updateMicronet(hook,oldSubscriber,hook.result)
        }
      }
    ],
    patch: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber } = params

        // Cascading updates on changed Gateway ID
        if(hook.result.gatewayId != oldSubscriber.gatewayId) {
          // Update Gateway ID for switch config
          const switchConfig = await updateSwitchConfig(hook,oldSubscriber)

          // Update socket url for associated subscriber
          const socket = await updateSocket(hook,oldSubscriber)

          // Updated associated Registry
          const registry = await updateRegistry(hook,oldSubscriber,socket)

          // Updated associated Micronet
          const micronet = await updateMicronet(hook,oldSubscriber,hook.result)
        }

      }
    ],
    remove: [
      async(hook) => {
        const { data, params, id } = hook
        logger.debug('\n REMOVE HOOK result : ' + JSON.stringify(hook.result))
        if(id) {
          await hook.app.service('/portal/v1/socket').remove(id,allHeaders)
          await hook.app.service('/portal/v1/users').remove(id,allHeaders)
          await axios({
            ...allHeaders,
            method: 'DELETE',
            url: `${hook.result.registry}/mm/v1/micronets/registry/${hook.result.id}`
          })
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
