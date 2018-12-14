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
        console.log('\n CSRT hook data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params))
        const subscriberId = hook.data.subscriberID
        console.log('\n CSRT subscriberId : ' + JSON.stringify(subscriberId))
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        console.log('\n CSRT axiosConfig : ' + JSON.stringify(axiosConfig))
        const registryUrl = hook.app.get ( 'registryServer' )
        console.log('\n\n registry server : '  + JSON.stringify(registryUrl) + '\t\t subscriberId : ' + JSON.stringify(subscriberId))
        let registry = await axios.get ( `${registryUrl}/mm/v1/micronets/registry/${subscriberId}`, axiosConfig )
        console.log('\n\n registry obtained : '  + JSON.stringify(registry.data))
        let mmApiurl = registry.data.mmUrl
        const mmApiResponse = await axios.post ( `${mmApiurl}/mm/v1/micronets/csrt` , { "subscriberId":subscriberId, registryUrl } , axiosConfig );
        console.log('\n mmApiResponse data :  ' + JSON.stringify(mmApiResponse.data) )
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
