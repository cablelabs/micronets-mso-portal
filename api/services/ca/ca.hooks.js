const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const PROD_ENV = "production"

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async ( hook ) => {
        const { params , data , payload } = hook;
        const subscriberId = data.subscriberID
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const registryUrl = hook.app.get ( 'registryServer' )
        let registry = await axios.get ( `${registryUrl}/mm/v1/micronets/registry/${subscriberId}`, axiosConfig )
        let mmApiurl = registry.data.mmUrl
        const mmApiResponse = await axios.post ( `${mmApiurl}/mm/v1/micronets/csrt` , { "subscriberId":subscriberId, registryUrl } , axiosConfig );
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
        console.log ( '\n CSRT Template :' + JSON.stringify ( hook.result ) )
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
