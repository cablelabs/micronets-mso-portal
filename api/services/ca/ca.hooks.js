const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const errors = require('@feathersjs/errors');
const logger = require ( './../../logger' );
const paths = require('./../../hooks/servicePaths')
const { MM_CSRT_PATH, MM_REGISTRY_PATH, SUBSCRIBER_PATH } = paths
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async ( hook ) => {
        const { params , data , payload } = hook;
        const subscriberId = data.subscriberID || data.subscriberId
        logger.debug( '\n subscriberId :' + JSON.stringify ( subscriberId ) )
        if(!subscriberId) {
          return Promise.reject(new errors.BadRequest('Invalid Post Request', {
            subscriberID:'Missing subscriber ID'
          }))
        }
        else {
          let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
          const subscriberInfo = await hook.app.service(`${SUBSCRIBER_PATH}`).get(subscriberId)
          const registryUrl =  subscriberInfo && subscriberInfo.hasOwnProperty('registry') ? subscriberInfo.registry : undefined
          logger.debug('\n Subscriber info : ' + JSON.stringify(subscriberInfo) + '\t\t registryUrl : ' + JSON.stringify(registryUrl))
          if(registryUrl == undefined){
            return Promise.reject(new errors.GeneralError(new Error('No associated registry present')))
          }
          let registry = await axios.get ( `${registryUrl}/${MM_REGISTRY_PATH}/${subscriberId}`, axiosConfig )
          let mmApiurl = registry.data.mmUrl
          logger.debug( '\n Registry from MM :' + JSON.stringify ( registry.data ) )
          const mmApiResponse = await axios.post ( `${mmApiurl}/${MM_CSRT_PATH}` , { "subscriberId":subscriberId, registryUrl } , axiosConfig );
          logger.debug( '\n MMApiResponse CSRT :' + JSON.stringify ( mmApiResponse.data ) )
          hook.data = Object.assign ( {} ,
            {
              csrTemplate : mmApiResponse.data.csrTemplate ,
              debug : {
                context : {
                  token : mmApiResponse.data.debug.context.token ,
                  clientID : mmApiResponse.data.debug.context.clientID ,
                  deviceID : mmApiResponse.data.debug.context.deviceID ,
                  class : mmApiResponse.data.debug.context.class,
                  timestamp : mmApiResponse.data.debug.context.timestamp ,
                  subscriber : Object.assign ( {} ,mmApiResponse.data ? omitMeta ( mmApiResponse.data.debug.context.subscriber ) : { info : 'No subscriber found' } )
                }
              }
            } );
        }
        }
    ] ,
    update : [] ,
    patch : [] ,
    remove : []
  } ,

  after : {
    all : [] ,
    find : [] ,
    get : [] ,
    create : [
      async ( hook ) => {
        const { params , data , payload } = hook
        hook.result = omitMeta ( hook.data )
        logger.debug( '\n CSRT Template :' + JSON.stringify ( hook.result ) )
        return hook;
      }
    ] ,
    update : [] ,
    patch : [] ,
    remove : []
  } ,

  error : {
    all : [] ,
    find : [] ,
    get : [] ,
    create : [] ,
    update : [] ,
    patch : [] ,
    remove : []
  }
};
