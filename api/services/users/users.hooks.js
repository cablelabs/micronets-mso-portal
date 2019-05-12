const local = require('@feathersjs/authentication-local');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');
const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const {  REGISTER_PATH, SUBSCRIBER_PATH } = paths
const getRandomSubscriberId = () => {
 return ( ( Math.random ().toString ( 36 ).substring ( 2 , 15 ) + Math.random ().toString ( 36 ).substring ( 2 , 15 ) ))
}

module.exports = {
  before: {
    all: [],
    // all: [ authenticate('jwt') ],
    find: [
      async(hook) => {
        const { data , params } = hook;
        if(params.query.hasOwnProperty('available')) {
          logger.debug('\n Only return available users .. ')
          let msoRegistry =  await hook.app.service(`${REGISTER_PATH}`).find({})
          msoRegistry = msoRegistry.data
          let msoSubscribers = await hook.app.service(`${SUBSCRIBER_PATH}`).find({})
          let availableSubscriberIds = []
          msoSubscribers = msoSubscribers.data
          msoSubscribers.map((msoSubscriber)  => {
            msoRegistry.forEach((registry) => {
              if(registry.subscriberId != msoSubscriber.id) {
                return availableSubscriberIds.concat(msoSubscriber.id)
              }
            })
          })
          logger.debug('\n Available Subscriber IDs : ' + JSON.stringify(availableSubscriberIds))
        }
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
          subscriberId: data.subscriberId || getRandomSubscriberId()
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
