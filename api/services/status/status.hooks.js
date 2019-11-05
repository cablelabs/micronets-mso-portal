const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { MSO_STATUS_PATH } = paths
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      async(hook) => {
      const {data, params, id } = hook
      logger.debug('\n\n Status patch data : ' + JSON.stringify(data)  + '\t\t ID : ' + JSON.stringify(id))
        const statusData = await hook.app.service(`${MSO_STATUS_PATH}`).get(id)
        logger.debug('\n\n Status Data : ' + JSON.stringify(statusData))
        const statusPatchBody = Object.assign({},{
          deviceId: data.deviceId,
          events: statusData.events.concat(data.events)
        })
        logger.debug('\n Status Patch Body : ' + JSON.stringify(statusPatchBody))
        hook.data = Object.assign({},statusPatchBody)
        return Promise.resolve(hook)

      }
    ],
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
