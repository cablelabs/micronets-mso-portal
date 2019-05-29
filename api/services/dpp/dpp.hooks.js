const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const session  = require("express-session");
const MongoStore = require('connect-mongo')(session);
const local = require('@feathersjs/authentication-local');
const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { DPP_PATH, USERS_PATH, SUBSCRIBER_PATH, MM_DPP_ONBOARD_PATH, DPP_LOGIN, DPP_LOGOUT, DPP_ONBOARD, DPP_API_ONBOARD, DPP_CONFIG, DPP_SESSION } = paths
var auth = require('basic-auth')
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');
const notFound = new errors.NotFound('User does not exist');
var axios = require ( 'axios' );
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const jwt = require('jsonwebtoken');

const checkForCookie = async(hook) => {
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl, payload, jar } = params
  logger.debug('\n params.jar : ' + JSON.stringify(params.jar.get('id')))
  if(params.hasOwnProperty('jar') && params.jar.get('id')!= undefined){
    logger.debug('\n params.jar : ' + JSON.stringify(params.jar.get('id')) + '\t return true')
    return true
  }
  return false
}


const generateJWT = async(hook) => {
  const { data, params } = hook
  const { secret } = hook.app.get('authentication')
  logger.debug('\n Generated JWT Data Passed : ' + JSON.stringify(hook.data) + '\t\t secret : ' + JSON.stringify(secret));
  const token = jwt.sign(hook.data, secret );
  logger.debug('\n Generated JWT Token : ' + JSON.stringify(token));
  return token;
}



const getJWTFromCookie = async(hook) => {
  logger.debug('\n\n getJWTFromCookie ... ')
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl, payload, jar } = params

  if(jar) {
    // verify a token symmetric - synchronous
    const cookieName = hook.app.get('cookieName')
    const jwtToken = jar.get(cookieName)
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
        return Object.assign({},{ user: dbUsers[userIndex], jwtToken : jwtToken })
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

const checkIfTokenExistsForUser = async(hook, user) => {
logger.debug('\n checkIfTokenExistsForUser user : ' + JSON.stringify(user))
  if(user && user.hasOwnProperty('username')) {
    const loggedInUsers = await hook.app.service(`${DPP_PATH}`).find({})
    const loggedInUserIndex = loggedInUsers.data.length > 0 ? loggedInUsers.data.findIndex((loggedUser) => loggedUser.username == user.username) : -1
    logger.debug('\n loggedInUserIndex : ' + JSON.stringify(loggedInUserIndex))
    if(loggedInUserIndex > -1){
      logger.debug('\n loggedInUserIndex : ' + JSON.stringify(loggedInUserIndex) + '\t\t LoggedInUser : ' + JSON.stringify(loggedInUsers.data[loggedInUserIndex]))
      return Object.assign({loggedInUser: loggedInUsers.data[loggedInUserIndex], loggedInUserIndex: loggedInUserIndex })
    }
    else {
      return Object.assign({loggedInUser: undefined, loggedInUserIndex: loggedInUserIndex })
    }
  }
}

const restrictToOwner = async(hook) => {
  logger.debug('\n  Checking for valid user with payload ')
  const { data, params, id, headers} = hook
  if(data.hasOwnProperty('username') && data.hasOwnProperty('password')) {
    logger.debug('\n Payload : ' + JSON.stringify(data))
    let dbUsers = await hook.app.service ( `${USERS_PATH}` ).find ( {} )
    dbUsers = dbUsers.data
    logger.debug('\n Portal Users  : ' + JSON.stringify(dbUsers) )
    let userIndex = dbUsers.findIndex ( ( dbuser , index ) => dbuser.username == data.username )
    logger.debug('\n User Index  : ' + JSON.stringify(userIndex))

    if(userIndex == -1 ){
      return Promise.reject(new errors.NotFound(new Error('User not found')))
    }
    else {
      const match = await bcrypt.compare(data.password, dbUsers[userIndex].password);
      logger.debug('\n Match  : ' + JSON.stringify(match))
      if(match) {
        logger.debug('\n User found : ' + JSON.stringify(dbUsers[userIndex]))
        return dbUsers[userIndex]
      }
      else {
        return Promise.reject(new errors.NotAuthenticated(new Error('Invalid username or password')))
      }
    }
  }
  else {
    return Promise.reject(new errors.Forbidden(new Error('Missing authorization headers')))
  }
}

const restrictToOwnerWithAuth = async(hook) => {
  logger.debug('\n  Checking for valid user with auth header ')
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl, requestBody } = params
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
      return Promise.reject(new errors.NotFound(new Error('User not found')))
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
        return Promise.reject(new errors.NotAuthenticated(new Error('Invalid username or password')))
      }
    }
  }
  else {
    return Promise.reject(new errors.Forbidden(new Error('Missing authorization headers')))
  }
}

const restrictToOwnerWithJWT = async(hook) => {
  logger.debug('\n  Checking for valid user with JWT ')
  const { data, params, id, headers} = hook
  const { requestHeaders, requestUrl, payload } = params

  if(payload) {
    let dbUsers = await hook.app.service ( `${USERS_PATH}` ).find ( {} )
    dbUsers = dbUsers.data
    logger.debug('\n Portal Users  : ' + JSON.stringify(dbUsers) )
    let userIndex = dbUsers.findIndex ( ( dbuser , index ) => dbuser.username == payload.username )
    logger.debug('\n User Index  : ' + JSON.stringify(userIndex))

    if(userIndex == -1 ){
      return Promise.reject(notFound)
    }
    else {
      const match = await bcrypt.compare(payload.password, dbUsers[userIndex].password);
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
    return Promise.reject(new errors.Forbidden(new Error('Missing authorization headers')))
  }
}

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
    // all : [],
    all: [],
    find: [],
    get: [
      async(hook) => {
        const {data, params, id, headers} = hook
        const { requestHeaders, requestUrl, requestBody } = params
        if(requestUrl == DPP_CONFIG) {
          const  classCategories  = hook.app.get('classCategories')
          logger.debug('\n classCategories : ' + JSON.stringify(classCategories))
          hook.result = classCategories
        }
        if ( requestUrl == DPP_SESSION ) {
          const isCookiePresent = await checkForCookie(hook)
          if(!isCookiePresent){
            logger.debug('\n Is cookie present : ' + JSON.stringify(isCookiePresent))
            return Promise.reject(new errors.NotAuthenticated(new Error('401')))
          }

          const { user, jwtToken } = await getJWTFromCookie(hook)
          logger.debug('\n Dpp session username : ' + JSON.stringify(user) + '\t\t Associated token : ' + JSON.stringify(jwtToken))
          if (user && user.hasOwnProperty('username')) {
            const dpp = await hook.app.service(`${DPP_PATH}`).find({})
            const dppIndex = dpp.data.findIndex((dpp)=> dpp.username == user.username)
            logger.debug('\n DPP INDEX : ' + JSON.stringify(dppIndex))
            if(dppIndex > -1) {
              logger.debug('\n DPP USERNAME : ' + JSON.stringify(dpp.data[dppIndex].username))
              hook.result = Object.assign({session:true})
            }
            else {
              return Promise.reject(new errors.NotAuthenticated(new Error('401')))
            }
          }
        }
      }
    ],
    create: [
      async(hook) => {
        const { data , params } = hook
        logger.debug ( '\n\n DPP-LOGIN data : ' + JSON.stringify ( data ) )
        const { requestHeaders , requestUrl , requestBody , jar } = params
        logger.debug ( '\n\n  requestBody : ' + JSON.stringify ( requestBody ) )

        if ( requestUrl == DPP_LOGIN ) {
          logger.debug ( '\n\n DPP-LOGIN PATH ... : ' + JSON.stringify ( requestUrl ) + '\t\t Data : ' + JSON.stringify ( data ) )
          const portalUser = await restrictToOwner ( hook )
          logger.debug ( '\n Database user found : ' + JSON.stringify ( portalUser ) )
          if ( portalUser && portalUser.hasOwnProperty ( 'username' ) ) {
            // User found. Create JWT Token
            const { loggedInUser , loggedInUserIndex } = await checkIfTokenExistsForUser ( hook , portalUser )
            if ( loggedInUserIndex > -1 && loggedInUser && loggedInUser.hasOwnProperty ( 'username' ) ) {
              logger.debug ( '\n User is already logged in and has a token ' )
              hook.result = Object.assign ( {} , {
                status: 'User logged in'
              } )
              // Add JWT Token in a cookie
              jar.set ( `${hook.app.get ( 'cookieName' )}` , loggedInUser.token )
              return Promise.resolve ( hook )
            }
            else {
              logger.debug ( '\n User is logging in for first time.Generate token ' )
              const token = await generateJWT ( hook )
              if ( token ) {
                hook.data = Object.assign ( {
                  username : portalUser.username ,
                  token : token
                } )
                // hook.result = Object.assign({ description: 'Session created' })
                // Add JWT Token in a cookie
                jar.set ( `${hook.app.get ( 'cookieName' )}` , token )
              }
            }
          }
        }

        if ( requestUrl == DPP_LOGOUT ) {
          logger.debug ( '\n\n RequestUrl ... : ' + JSON.stringify ( requestUrl ) + '\t\t Data : ' + JSON.stringify ( data ) )
          const { user, jwtToken } = await getJWTFromCookie(hook)
          logger.debug('\n Dpp session username : ' + JSON.stringify(user) + '\t\t Associated token : ' + JSON.stringify(jwtToken))
          if (user && user.hasOwnProperty('username')) {
            const dpp = await hook.app.service(`${DPP_PATH}`).find({})
            const dppIndex = dpp.data.findIndex((dpp)=> dpp.username == user.username)
            logger.debug('\n DPP Index : ' + JSON.stringify(dppIndex))

            if(dppIndex > -1) {
            logger.debug('\n DPP Username : ' + JSON.stringify(dpp.data[dppIndex].username))
            const deleteUser = await hook.app.service(`${DPP_PATH}`).remove(dpp.data[dppIndex].username)
            logger.debug('\n Delete User : ' + JSON.stringify(deleteUser.data))
            }
          }
        }

        if ( requestUrl == DPP_ONBOARD ) {
          logger.debug ( '\n\n RequestUrl ... : ' + JSON.stringify ( requestUrl ) + '\t\t Data : ' + JSON.stringify ( data ) )
          const { user, jwtToken } = await getJWTFromCookie(hook)
          logger.debug('\n Dpp session username : ' + JSON.stringify(user) + '\t\t Associated token : ' + JSON.stringify(jwtToken))
          let axiosConfig = { headers : { 'Authorization' : `Bearer ${jwtToken}` } };
          const postOnboardingMsoUrl = `http://${hook.app.get('host')}:${hook.app.get('port')}${DPP_API_ONBOARD}`
          logger.debug('\n MSO Onboarding api url : ' + JSON.stringify(postOnboardingMsoUrl))
          const postOnboardResponse = await axios.post (`${postOnboardingMsoUrl}` ,  data , axiosConfig)
          logger.debug('\n DPP Hook postOnboardResponse : ' + JSON.stringify(postOnboardResponse.data))
          hook.result = postOnboardResponse.data
          return Promise.resolve(hook)
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
      local.hooks.protect('password'),
      async(hook) => {
      hook.result = omitMeta(hook.result)
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
