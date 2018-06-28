const { authenticate } = require ( 'feathers-authentication' ).hooks;
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
      async function ( hook ) {
        const { params , data , payload } = hook;
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        console.log('\n CA hook data : ' + JSON.stringify(data))
        console.log('\n CA hook params : ' + JSON.stringify(params))
        const registryUrl = hook.app.get ( 'registryServer' )
        console.log('\n registry server url : ' + JSON.stringify(registryUrl))
        let registry = await axios.get ( `${registryUrl}/micronets/v1/mm/registry/${hook.data.subscriberId}`, axiosConfig )
        console.log('\n Registry obtained from server : ' + JSON.stringify(registry.data))
        let mmApiurl = registry.data.mmUrl
        console.log('\n CA hook mmApiurl : ' + JSON.stringify(mmApiurl))
        const mmApiResponse = await axios.post ( `${mmApiurl}/micronets/v1/mm/csrt` , data , axiosConfig );
        console.log('\n mmApiResponse : ' + JSON.stringify(mmApiResponse.data))
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
      async function ( hook ) {
        const { params , data , payload } = hook
        hook.result = omitMeta ( hook.data )
        console.log ( '\n CA hook result :' + JSON.stringify ( hook.result ) )
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
