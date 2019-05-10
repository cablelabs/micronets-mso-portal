const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const local = require('@feathersjs/authentication-local');
const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { DPP_PATH, USERS_PATH, SUBSCRIBER_PATH, MM_DDP_ONBOARD_PATH } = paths
const DPP_LOGIN = `/${DPP_PATH}/login`
const DPP_LOGOUT = `/${DPP_PATH}/logout`
const DPP_ONBOARD = `/${DPP_PATH}/onboard`
const DPP_CONFIG = `/${DPP_PATH}/config`
// const authenticate = require('@feathersjs/authentication');
var auth = require('basic-auth')
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');
const notFound = new errors.NotFound('User does not exist');
var axios = require ( 'axios' );

const restrictToOwner = async(hook) => {
  logger.debug('\n  restrictToOwner Checking for valid user ')
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl } = params
  const { headers: { authorization }} = params
  if(authorization) {
    logger.debug('\n Authorization Header : ' + JSON.stringify(authorization))
    const user = auth.parse (authorization )
    logger.debug('\n auth.parse ( authorization ) ' + JSON.stringify(user))
    let dbUsers = await hook.app.service ( `${USERS_PATH}` ).find ( {} )
    dbUsers = dbUsers.data
    logger.debug('\n Portal Users  : ' + JSON.stringify(dbUsers) )
    let userIndex = dbUsers.findIndex ( ( dbuser , index ) => dbuser.username == user.name )
    logger.debug('\n User Index  : ' + JSON.stringify(userIndex))

    if(userIndex == -1 ){
      return Promise.reject(new errors.NotAuthenticated(new Error('401')))
    }
    else {
      const match = await bcrypt.compare(user.pass, dbUsers[userIndex].password);
      logger.debug('\n Match  : ' + JSON.stringify(match))
      if(match) {
        logger.debug('\n User found : ' + JSON.stringify(dbUsers[userIndex]))
        // hook.result = Object.assign({}, dbUsers[userIndex])
        return dbUsers[userIndex]
      }
      else {
        return Promise.reject(notFound)
      }
    }
  }
  else {
    return Promise.reject(new errors.Forbidden(new Error('Missing authorization headers')))
  }
}


module.exports = {
  before: {
    all : [],
    // all: [ authenticate('jwt') ],
    find: [],
    get: [
      async(hook) => {
        const {data, params, id, headers} = hook
        const { requestHeaders, requestUrl } = params
        if(requestUrl == DPP_CONFIG) {
          const  classCategories  = hook.app.get('classCategories')
          logger.debug('\n classCategories : ' + JSON.stringify(classCategories))
          hook.result = classCategories
        }
      }
    ],
    create: [
      async(hook) => {
        const { data, params } = hook
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const portalUser = await restrictToOwner(hook)
        logger.debug('\n Create hook Portal User ' + JSON.stringify(portalUser))
        if(portalUser && portalUser.hasOwnProperty('username')) {
          const {data, params, id, headers} = hook
          const { requestHeaders, requestUrl } = params
          logger.debug('\n\n Data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params) + '\t\t Request Headers : ' + JSON.stringify(requestHeaders) + '\t\t Request Url : ' + JSON.stringify(requestUrl))
          if(requestUrl == DPP_LOGIN) {
            logger.debug('\n\n DPP LOGIN PATH ... ' + JSON.stringify(requestUrl))
            hook.result = Object.assign({description:'session created'})
          }
          if(requestUrl == DPP_ONBOARD) {
            logger.debug('\n\n DPP ONBOARD PATH ... ' + JSON.stringify(requestUrl))
            const subscriber = await hook.app.service(`${SUBSCRIBER_PATH}`).get(portalUser.subscriberId)
            logger.debug('\n Subscriber from session ' + JSON.stringify(subscriber))
            const dppOnboardResponse = await axios.post ( `${subscriber.registry}/${MM_DDP_ONBOARD_PATH}` , { ...data } , axiosConfig );

          }
        }
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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
