const local = require('@feathersjs/authentication-local');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');
const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const {  REGISTER_PATH, SUBSCRIBER_PATH } = paths
const uuid = require('uuid/v4')
const getRandomSubscriberId = () => {
 // return ( ( Math.random ().toString ( 36 ).substring ( 2 , 15 ) + Math.random ().toString ( 36 ).substring ( 2 , 15 ) ))
  return uuid()
}

module.exports = {
  before: {
    all: [],
    // all: [ authenticate('jwt') ],
    find: [
      async(hook) => {
        const { data , params } = hook;
        // if(params.query && params.query.hasOwnProperty('available')) {
        //   logger.debug('\n Only return available users .. ')
        //   let msoRegistry =  await hook.app.service(`${REGISTER_PATH}`).find({})
        //   msoRegistry = msoRegistry.data
        //   let msoSubscribers = await hook.app.service(`${SUBSCRIBER_PATH}`).find({})
        //   let availableSubscriberIds = []
        //   msoSubscribers = msoSubscribers.data
        //   msoSubscribers.map((msoSubscriber)  => {
        //     msoRegistry.forEach((registry) => {
        //       if(registry.subscriberId != msoSubscriber.id) {
        //         return availableSubscriberIds.concat(msoSubscriber.id)
        //       }
        //     })
        //   })
        //   logger.debug('\n Available Subscriber IDs : ' + JSON.stringify(availableSubscriberIds))
        // }
      }
    ],
    get: [
      async(hook) => {
        const { data , params } = hook;
        logger.debug('\n GET USERS HOOK data : ' + JSON.stringify(data) + '\t\t params : ' + JSON.stringify(params))
      }
    ],
    create: [
      async(hook) => {
        const { data , params } = hook;
        let hashPwd = bcrypt.hashSync(data.password, saltRounds);
        hook.data = Object.assign({},{
          username:data.username,
          password:hashPwd,
          subscriberId: data.hasOwnProperty('subscriberId') ? data.subscriberId : getRandomSubscriberId()
        })
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      local.hooks.protect('password')
    ],
    find: [],
    get: [],
    create: [
      async(hook) => {
       const { data, params } = hook
       logger.debug('\n Created hook.result : ' + JSON.stringify(hook.result))
        if(hook.result && hook.result.hasOwnProperty('subscriberId')){
          let subscribers = await hook.app.service(`${SUBSCRIBER_PATH}`).find({})
          subscribers = subscribers.data
          logger.debug('\n All subscribers : ' + JSON.stringify(subscribers))
          const subscriberIndex =  subscribers.length > 0 ? subscribers.findIndex((sub) => sub.id == hook.result.subscriberId) : -1
          logger.debug('\n\n Subscriber Index : ' + JSON.stringify(subscriberIndex))
          if(subscriberIndex == -1) {
            let msoRegistry = await hook.app.service(`${REGISTER_PATH}`).find({})
            msoRegistry = msoRegistry.data
            logger.debug('\n\n MSO Registry : ' + JSON.stringify(msoRegistry))
            const registryIndex = msoRegistry.length > 0 ? msoRegistry.findIndex((registry) => registry.subscriberId == hook.result.subscriberId) : -1
            logger.debug('\n\n Subscriber Index : ' + JSON.stringify(subscriberIndex))
            const registryUrl  =  msoRegistry[registryIndex]
            const subscriberPostBody = Object.assign({},{
              id: hook.result.subscriberId,
              ssid: 'NA',
              name: hook.result.username,
              gatewayId : `default-gw-${hook.result.subscriberId}`,
              registry: registryIndex != -1 ? registryUrl : ''
            })
            const subscriber = await hook.app.service(`${SUBSCRIBER_PATH}`).create(subscriberPostBody)
          }
        }
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
