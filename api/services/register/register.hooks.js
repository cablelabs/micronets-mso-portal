const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { SUBSCRIBER_PATH } = paths

const updateSubscriber = async (hook) => {
logger.debug('\n Update Subscriber ')
  let subscribers = await hook.app.service(`${SUBSCRIBER_PATH}`).find({})
  subscribers = subscribers.data
  const subscriberIndex = subscribers.length > 0 ? subscribers.findIndex((subscriber)=> subscriber.id == hook.result.subscriberId) : -1
  if( subscriberIndex != -1) {
    await hook.app.service(`${SUBSCRIBER_PATH}`).patch(hook.result.subscriberId, Object.assign({
      registry: hook.result.registry
    }))
  }
}
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
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
      async(hook) => {
       const { data, params } = hook
       logger.debug('\n MSO Registry after create data : '  + JSON.stringify(hook.result))
        await updateSubscriber(hook)
      }
    ],
    update: [
      async(hook) => {
        const { data, params } = hook
        logger.debug('\n MSO Registry after update data : '  + JSON.stringify(hook.result))
        await updateSubscriber(hook)
      }
    ],
    patch: [
      async(hook) => {
        const { data, params } = hook
        logger.debug('\n MSO Registry after patch data : '  + JSON.stringify(hook.result))
        await updateSubscriber(hook)
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
