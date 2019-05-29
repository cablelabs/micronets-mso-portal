const logger = require ( './../../logger' );
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
    find: [

    ],
    get: [],
    create: [
      async(hook) => {
        const statusResult = hook.result
        const updatedEvents  = [...new Set(hook.result.devices[0].events)]
        const updatedDevicesResult = Object.assign({},
          {
            deviceId:hook.result.devices[0].deviceId,
            events: [...new Set(hook.result.devices[0].events)]
          })
        const finalResult = Object.assign({},{
          subscriberId: hook.result.subscriberId,
          devices:[ updatedDevicesResult]
        })
        logger.debug('\n Hook.result : ' + JSON.stringify(finalResult))
        hook.ressult = finalResult
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
