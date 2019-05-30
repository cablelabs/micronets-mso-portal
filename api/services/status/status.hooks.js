const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { MSO_STATUS_PATH } = paths
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async(hook) => {
        const statusResult = hook.data
        const allStatus = await hook.app.service(`${MSO_STATUS_PATH}`).find({})
        const statusIndex = allStatus.data.length > 0 ? allStatus.data.findIndex((status) => status.subscriberId == hook.data.subscriberId) : -1
        if(statusIndex > -1) {
          await hook.app.service(`${MSO_STATUS_PATH}`).remove(hook.data.subscriberId)
        }
        const updatedEvents  = [...new Set(hook.data.devices[0].events)]
        logger.debug('\n updatedEvents : ' + JSON.stringify(updatedEvents))
        const updatedDevicesResult = Object.assign({},
          {
            deviceId:hook.data.devices[0].deviceId,
            events: [...new Set(hook.data.devices[0].events)]
          })
        logger.debug('\n updatedDevicesResult : ' + JSON.stringify(updatedDevicesResult))
        const finalResult = Object.assign({},{
          subscriberId: hook.data.subscriberId,
          devices:[ updatedDevicesResult]
        })
        logger.debug('\n Create patched Hook.data : ' + JSON.stringify(finalResult))
        hook.data = finalResult
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [

    ],
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
