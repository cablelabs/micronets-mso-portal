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
        const identityServer =  process.env.NODE_ENV != PROD_ENV ? hook.app.get ( 'identityServer' ) : hook.app.get ( 'identity_server_url' )
        const csrtUri = process.env.NODE_ENV != PROD_ENV ? identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.csrt ) : identityServer
        console.log ( '\n CA Identity server uri : ' + JSON.stringify ( csrtUri ) )
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const certs = await axios.post ( csrtUri , data , axiosConfig );
        console.log('\n Certs from Identity server : ' + JSON.stringify(certs.data))
        let subscriber = await hook.app.service ( '/internal/subscriber' ).find ( { query : { id : hook.data.subscriberID } } );
        console.log ( '\n Subscriber found : ' + JSON.stringify ( subscriber ) )
        const sessionData = Object.assign ( {} , {
          subscriberId : subscriber.data[ 0 ].id ,
          name : subscriber.data[ 0 ].name ,
          ssid : subscriber.data[ 0 ].ssid
        } )
        const ssData = await hook.app.service ( '/portal/session' ).find ( { query : { id : subscriber.data[ 0 ].id } } )
        let hostUrl = hook.app.get('host').concat(':').concat(hook.app.get('port'))
        hostUrl = (hostUrl.match(/http/g) || []).length == 1 ? `${hostUrl}/portal/session` : `http://${hostUrl}/portal/session`
        console.log('\n Session Url : ' + JSON.stringify(hostUrl))
        const session = ssData.data.length == 0 ?
          await axios.post ( hostUrl , sessionData , axiosConfig ) :
          await hook.app.service ( '/portal/session/' ).update ( subscriber.data[ 0 ].id , {
            clientId : params.payload.clientID ,
            deviceId : params.payload.deviceID ,
            macAddress : params.payload.macAddress ,
            class : params.payload.class,
            isRegistered : false
          } );
        hook.data = Object.assign ( {} ,
          {
            csrTemplate : certs.data.csrTemplate ,
            debug : {
              context : {
                token : jwtToken ,
                clientID : params.payload.clientID ,
                deviceID : params.payload.deviceID ,
                class : params.payload.class,
                timestamp : params.payload.iat ,
                subscriber : Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } )
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
