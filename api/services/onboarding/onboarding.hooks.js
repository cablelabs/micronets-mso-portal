const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { USERS_PATH, SUBSCRIBER_PATH, MM_DPP_ONBOARD_PATH, DPP_LOGIN, DPP_LOGOUT, DPP_ONBOARD, DPP_CONFIG, DPP_SESSION } = paths
var auth = require('basic-auth')
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');
const notFound = new errors.NotFound('User does not exist');
var axios = require ( 'axios' );
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const jwt = require('jsonwebtoken');

const restrictToOwnerWithCookie = async(hook) => {
  logger.debug('\n  Checking for valid user with JWT ')
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl, payload, jar } = params

  if(jar) {
    // verify a token symmetric - synchronous
    const jwtToken = jar.get('id')
    logger.debug('\n JWT Token from cookie : ' + JSON.stringify(jwtToken))
    const { secret } = hook.app.get('authentication')
    var decodedToken = jwt.verify(jwtToken, secret);
    logger.debug('\n JWT Token from cookie username : ' + JSON.stringify(decodedToken.username))
    logger.debug('\n JWT Token from cookie password : ' + JSON.stringify(decodedToken.password))

    let dbUsers = await hook.app.service ( `${USERS_PATH}` ).find ( {} )
    dbUsers = dbUsers.data
    logger.debug('\n Portal Users  : ' + JSON.stringify(dbUsers) )
    let userIndex = dbUsers.findIndex ( ( dbuser , index ) => dbuser.username == decodedToken.username )
    logger.debug('\n User Index  : ' + JSON.stringify(userIndex))

    if(userIndex == -1 ){
      return Promise.reject(notFound)
    }
    else {
      const match = await bcrypt.compare(decodedToken.password, dbUsers[userIndex].password);
      logger.debug('\n Match  : ' + JSON.stringify(match))
      if(match) {
        logger.debug('\n User found : ' + JSON.stringify(dbUsers[userIndex]))
        // hook.result = Object.assign({}, dbUsers[userIndex])
        return dbUsers[userIndex]
      }
      else {
        return Promise.reject(new errors.NotAuthenticated(new Error('401')))
      }
    }
  }
  else {
    return Promise.reject(new errors.Forbidden(new Error('Missing user cookie')))
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async(hook) => {
        const { data , params } = hook
        const { requestHeaders , requestUrl , requestBody , jar } = params
        logger.debug ( '\n\n  Onboarding requestBody : ' + JSON.stringify ( requestBody ) + '\t\t Request url ' + JSON.stringify(requestUrl))
        if ( requestUrl == DPP_ONBOARD ) {
          // logger.debug ( '\n DPP Create hook params DPP_ONBOARD : ' + JSON.stringify ( params ) )
          const portalUser = await restrictToOwnerWithCookie( hook )
          if ( portalUser && portalUser.hasOwnProperty ( 'username' ) ) {
            const { data , params , id , headers , payload } = hook
            const { requestHeaders , requestUrl } = params
            logger.debug ( '\n\n Data : ' + JSON.stringify ( data ) + '\t\t Request Url : ' + JSON.stringify ( requestUrl ) )
            logger.debug ( '\n\n DPP ON-BOARD PATH ... ' + JSON.stringify ( requestUrl ) )
            const subscriber = await hook.app.service ( `${SUBSCRIBER_PATH}` ).get ( portalUser.subscriberId )
            logger.debug ( '\n Subscriber from session ' + JSON.stringify ( subscriber ) + '\t\t RegistryUrl : ' + JSON.stringify ( subscriber.registry ) )
            if ( subscriber && subscriber.hasOwnProperty ( 'registry' ) ) {
              const mmDppUri = `${subscriber.registry}/${MM_DPP_ONBOARD_PATH}`
              const dppOnboardResponse = await axios.post ( mmDppUri , {
                ...data ,
                subscriberId : subscriber.id ,
                deviceConnection : 'wifi'
              } );
              logger.debug ( '\n dppOnboardResponse :  ' + JSON.stringify ( dppOnboardResponse.data ) )
              if(dppOnboardResponse.data && dppOnboardResponse.data.hasOwnProperty('message')){
                const { message } = dppOnboardResponse.data
                hook.result = Object.assign({},{ status: message })
                return Promise.resolve(hook)
              } else {
                hook.result = Object.assign({},{ status:'On-boarding in progress'})
                return Promise.resolve(hook)
              }
            }
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
    create: [
      async(hook) => {
        logger.debug('\n After create hook hook.result ' + JSON.stringify(hook.result))
        hook.result =  omitMeta(hook.result)
        return Promise.resolve(hook)
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
