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
const paths = require('./../../hooks/servicePaths')
const { MM_ODL_PATH, SOCKET_PATH, REGISTER_PATH, MM_REGISTRY_PATH, SUBSCRIBER_PATH, MM_SUBSCRIBER_PATH, DEVICES_PATH, USERS_PATH } = paths

const updateSwitchConfig = async(hook,oldSubscriber) => {
  const { data, params, method } = hook
  logger.debug('\n GatewayID updated . Update switch config for ' + JSON.stringify(`${oldSubscriber.registry}/mm/v1/micronets/odl/${oldSubscriber.gatewayId}`))
  let postBodySwitchConfig = {}
  const allSwitchConfigs = await axios({
    ...allHeaders,
    method: 'get',
    url: `${oldSubscriber.registry}/${MM_ODL_PATH}`
  })
  logger.debug('\n All switch configs : ' + JSON.stringify(allSwitchConfigs.data))
  const switchConfigIndex = allSwitchConfigs.data.length > 0 ? allSwitchConfigs.data.findIndex((swConfig) => swConfig.gatewayId == oldSubscriber.gatewayId) : -1
  logger.debug('\n SwitchConfigIndex : ' + JSON.stringify(switchConfigIndex))
  if(switchConfigIndex > -1) {
    const oldSwitchConfig = await axios({
      ...allHeaders,
      method: 'get',
      url: `${oldSubscriber.registry}/${MM_ODL_PATH}/${oldSubscriber.gatewayId}`
    })
    postBodySwitchConfig = Object.assign({}, oldSwitchConfig.data, {"gatewayId": hook.result.gatewayId })
    logger.debug('\n\n Post switch config : ' + JSON.stringify(postBodySwitchConfig))
    await axios({
      ...allHeaders,
      method: 'delete',
      url: `${oldSubscriber.registry}/${MM_ODL_PATH}/${oldSubscriber.gatewayId}`
    })
    const updatedSwitchConfig = await axios({
      ...allHeaders,
      method: 'post',
      url: `${oldSubscriber.registry}/${MM_ODL_PATH}`,
      data: postBodySwitchConfig
    })
    logger.debug('\n\n New switch config : ' + JSON.stringify(updatedSwitchConfig.data))
    return updatedSwitchConfig
  }
}

const updateSocket = async(hook,oldSubscriber) => {
  const { data, params, method } = hook
  let webSocketBaseUrl = hook.app.get('webSocketBaseUrl')
  logger.debug('\n Web socket base url from config : ' + JSON.stringify(webSocketBaseUrl) + '\t\t Method : ' + JSON.stringify(method))

  const oldSocket  = await hook.app.service(`${SOCKET_PATH}`).get(oldSubscriber.id)
  logger.debug('\n Retrieved oldSocket  : ' + JSON.stringify(oldSocket))

  const updateBody = Object.assign({},{
    socketUrl: `${webSocketBaseUrl}/${hook.result.id}`, //`${webSocketBaseUrl}/${hook.result.id}-${hook.result.gatewayId}`
    subscriberId: hook.result.id,
    gatewayId:hook.result.gatewayId
  })

  const socket = method == 'update' ? await hook.app.service(`${SOCKET_PATH}`).update(oldSubscriber.id,{...updateBody},allHeaders) : await hook.app.service('/portal/v1/socket').patch(oldSubscriber.id,{...updateBody},allHeaders)
  return socket
}

const updateRegistry = async(hook,oldSubscriber,socket, gatewayReconnection, oldRegistry) => {
  const { data, params, method } = hook
  const updateBody = Object.assign({},{
    subscriberId: hook.result.id,
    mmUrl: hook.result.registry,
    identityUrl: oldRegistry.identityUrl,
    mmClientUrl: hook.result.mmClientUrl,
    msoPortalUrl: `${hook.app.get('publicApiBaseUrl')}`,
    webSocketUrl: socket.socketUrl,
    gatewayId: hook.result.gatewayId,
    gatewayReconnection: gatewayReconnection
  })
  const axiosReqType = method == 'update' ? 'put' : 'patch'
  logger.debug('\n Update registry body : ' + JSON.stringify(updateBody))
  const registry =  await axios({
    ...allHeaders,
    method: axiosReqType,
    url: `${hook.result.registry}/${MM_REGISTRY_PATH}/${hook.result.id}`,
    data: {...updateBody}
  })

  return registry
}

const updateMicronet = async(hook,oldSubscriber,result) => {
  logger.debug('\n\n Updating micronet')
  const { data, params, method } = hook
  let mmBaseUrl = hook.result.registry
  const allMicronets = await axios({
    ...allHeaders,
    method: 'GET',
    url: `${hook.result.registry}/${MM_SUBSCRIBER_PATH}`
  })
  logger.debug('\n All micronets : ' + JSON.stringify(allMicronets.data))
  const micronetIndex = allMicronets.data.length > 0 ? allMicronets.data.findIndex((micronet) => micronet.subscriberId == oldSubscriber.id) : -1
  logger.debug('\n Micronet Index : ' + JSON.stringify(micronetIndex))

  // Update the found micronet
  if(micronetIndex > -1){
    const updateBody = Object.assign({},{
      ssid: hook.result.ssid,
      name: hook.result.name,
      gatewayId: hook.result.gatewayId
    })
    const micronet = await axios({
      ...allHeaders,
      method: 'PATCH',
      url: `${hook.result.registry}/${MM_SUBSCRIBER_PATH}/${oldSubscriber.id}`,
      data: {...updateBody}
    })
  }
}

module.exports = {
  before: {
    all : [] ,
    find: [],
    get: [
      hook => {
        return hook.app.service(`${SUBSCRIBER_PATH}`).find({ query: { id: hook.id } })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
          });
      }
    ],
    create: [
      async(hook) => {
        const { data, params}  = hook
        logger.debug('\n Create subscriber hook data : ' + JSON.stringify(data))
        if(data.hasOwnProperty('username') && data.hasOwnProperty('password')) {
          logger.debug('\n\n Might have to create a user ...')
          hook.params.username = data.username
          hook.params.password = data.password
        }
        const msoRegistry = await hook.app.service(`${REGISTER_PATH}`).find({})
        const msoRegistryIndex = msoRegistry.data.findIndex((msoRegistry)=> msoRegistry.subscriberId == data.id)
        logger.debug('\n Accessing all registries : ' + JSON.stringify(msoRegistry.data) + '\t\t Index : ' + JSON.stringify(msoRegistryIndex))
        // if(msoRegistryIndex == -1) {
        //   return Promise.reject(new errors.GeneralError(new Error(' Subscriber cannot be created. Associated registry for subscriber not found !')))
        // }
        // if(msoRegistryIndex!= -1 && data.hasOwnProperty('registry') && msoRegistry.data[msoRegistryIndex].registry != data.registry){
        //   return Promise.reject(new errors.GeneralError(new Error(' Subscriber cannot be created. Multiple values for registry found !')))
        // }

        // Populate using passed value or look up register endpoint to retrieve value
        if(data.registry || (msoRegistryIndex!= -1 && !data.hasOwnProperty('registry'))) {
          hook.data.registry = data.registry ? data.registry : msoRegistry.data[msoRegistryIndex].registry
          return Promise.resolve(hook)
        }
      }
    ],
    update: [
      async(hook) => {
        const { data, params, id}  = hook
        const oldSubscriber = await hook.app.service(`${SUBSCRIBER_PATH}`).get(hook.id)
        const msoRegistry = await hook.app.service(`${REGISTER_PATH}`).get(hook.id)
        const mmRegistry = await axios.get(`${msoRegistry.registry}/${MM_REGISTRY_PATH}/${hook.id}`)
        hook.params.oldSubscriber = Object.assign({},oldSubscriber)
        hook.params.oldRegistry = Object.assign({},mmRegistry.data)
    }
    ],
    patch: [
      async(hook) => {
        const { data, params, id}  = hook
        const oldSubscriber = await hook.app.service(`${SUBSCRIBER_PATH}`).get(hook.id)
        const msoRegistry = await hook.app.service(`${REGISTER_PATH}`).get(hook.id)
        const mmRegistry = await axios.get(`${msoRegistry.registry}/${MM_REGISTRY_PATH}/${hook.id}`)
        hook.params.oldSubscriber = Object.assign({},oldSubscriber)
        hook.params.oldRegistry = Object.assign({},mmRegistry.data)
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
          socketUrl: `${webSocketBaseUrl}/${hook.result.id}`,
          subscriberId: hook.result.id,
          gatewayId:hook.result.gatewayId
        })
        await hook.app.service(`${SOCKET_PATH}`).create(postSocket,allHeaders)
        const socket  = await hook.app.service(`${SOCKET_PATH}`).get(hook.result.id)
        logger.debug('\n Retrieved  socket  : ' + JSON.stringify(socket))

        // Create User for associated subscriber
        // const mmBaseUrl = hook.result.registry.split('://')[1].split(':')[0]
        // logger.debug('\n Derived base url : ' + JSON.stringify(mmBaseUrl))
        // const user = Object.assign({},{
        //     id: hook.result.id,
        //     ssid: hook.result.ssid,
        //     name: hook.result.name,
        //     mmUrl: `http://${mmBaseUrl}:8080`
        //   })
        // await hook.app.service (`${DEVICES_PATH}`).create(user, allHeaders)


        // Create user if it does not exist and username and password are supplied
        if(hook.params.hasOwnProperty('username') && hook.params.hasOwnProperty('password')) {
          const allUsers = await hook.app.service(`${USERS_PATH}`).find({})
          const userIndex = allUsers.data.length > 0 ? allUsers.data.findIndex((user) => user.subscriberId == hook.result.subscriberId) : -1
          logger.debug('\n User Index : ' + JSON.stringify(userIndex))
          if(userIndex == -1) {
            const postUserBody = Object.assign({},{
              username: hook.params.username,
              password: hook.params.password,
              subscriberId: hook.result.id
            })
            logger.debug('\n POST User body : ' + JSON.stringify(postUserBody))
            const userRes = await hook.app.service(`${USERS_PATH}`).create(postUserBody)
            logger.debug('\n userRes : ' + JSON.stringify(userRes.data))
          }
        }
        hook.result = omitMeta(hook.result)
        return hook;
      }
    ],
    update: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber, oldRegistry } = params

        const gatewayIdUpdate = hook.result.gatewayId != oldSubscriber.gatewayId ? true : false
        const ssidUpdate = hook.result.ssid != oldSubscriber.ssid ? true : false
        logger.debug('\n gatewayIdUpdate : ' + JSON.stringify(gatewayIdUpdate) + '\t\t SSID Update : ' + JSON.stringify(ssidUpdate))
        // Cascading updates on changed Gateway ID
        if(gatewayIdUpdate || ssidUpdate) {
        // Update Gateway ID for switch config
        const switchConfig = await updateSwitchConfig(hook,oldSubscriber)

        // Update socket url for associated subscriber
        const socket = await updateSocket(hook,oldSubscriber)

        // Updated associated Registry
        const registry = await updateRegistry(hook,oldSubscriber,socket, gatewayIdUpdate,oldRegistry)

        // Updated associated Micronet
        const micronet = await updateMicronet(hook,oldSubscriber,hook.result)
        }
      }
    ],
    patch: [
      async(hook) => {
        const { params  , payload, id } = hook;
        const { oldSubscriber, oldRegistry } = params

        const gatewayIdUpdate = hook.result.gatewayId != oldSubscriber.gatewayId ? true : false
        const ssidUpdate = hook.result.ssid != oldSubscriber.ssid ? true : false
        logger.debug('\n gatewayIdUpdate : ' + JSON.stringify(gatewayIdUpdate) + '\t\t SSID Update : ' + JSON.stringify(ssidUpdate))
        // Cascading updates on changed Gateway ID
        if(gatewayIdUpdate || ssidUpdate) {
          // Update Gateway ID for switch config
          const switchConfig = await updateSwitchConfig(hook,oldSubscriber)

          // Update socket url for associated subscriber
          const socket = await updateSocket(hook,oldSubscriber)

          // Updated associated Registry
          const registry = await updateRegistry(hook,oldSubscriber,socket, gatewayIdUpdate,oldRegistry)

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
          await hook.app.service(`${SOCKET_PATH}`).remove(id,allHeaders)
          // await hook.app.service(`${DEVICES_PATH}`).remove(id,allHeaders)
          await hook.app.service(`${REGISTER_PATH}`).remove(id,allHeaders)
          await hook.app.service(`${USERS_PATH}`).remove(id,allHeaders)
          await axios({
            ...allHeaders,
            method: 'DELETE',
            url: `${hook.result.registry}/${MM_REGISTRY_PATH}/${hook.result.id}`
          })
        }
        else {
          await hook.app.service(`${SOCKET_PATH}`).remove(null,allHeaders)
          // await hook.app.service(`${DEVICES_PATH}`).remove(null,allHeaders)
          await hook.app.service(`${REGISTER_PATH}`).remove(null,allHeaders)
          await hook.app.service(`${USERS_PATH}`).remove(null,allHeaders)
          await axios({
            ...allHeaders,
            method: 'DELETE',
            url: `${hook.result.registry}/${MM_REGISTRY_PATH}`
          })
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
