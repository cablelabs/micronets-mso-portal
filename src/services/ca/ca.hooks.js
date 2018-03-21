const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async function ( hook ) {
        const { params , data , payload } = hook;
        const identityServer = hook.app.get ( 'identityServer' );
        const identityServerUrl = hook.app.get ( 'identity_server_url' )
         const csrtUri = identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.csrt )
       // const csrtUri = identityServerUrl.concat ( identityServer.csrt )
        console.log ( '\n CA /csrt uri : ' + JSON.stringify ( csrtUri ) )
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const certs = await axios.post ( csrtUri , data , axiosConfig );
        const subscriber = await hook.app.service ( '/internal/subscriber' ).find ( { query : { id : hook.data.subscriberID } } );
        console.log('\n Subscriber CA hook : ' + JSON.stringify(subscriber))
        const sessionData = Object.assign ( {} , { subscriberId : subscriber.data[ 0 ].id } )
        const sessionPutData = Object.assign ( {} , { subscriberId : subscriber.data[ 0 ].id  } )
        const ssData = await hook.app.service('/portal/session').find({ query: { id: subscriber.data[ 0 ].id  } })
        const updateID = Object.assign({},{ id:subscriber.data[ 0 ].id })
        const session = ssData.data.length == 0 ?
          await axios.post ( 'http://localhost:3210/portal/session' , sessionData , axiosConfig ) :
          await hook.app.service('/portal/session/').update( subscriber.data[ 0 ].id , {
              clientId : params.payload.clientID ,
              deviceId : params.payload.deviceID ,
              macAddress : params.payload.macAddress
            });
        hook.data = Object.assign ( {} ,
          {
            csrTemplate : certs.data.csrTemplate ,
            debug : {
              context : {
                token : jwtToken ,
                clientID : params.payload.clientID ,
                deviceID : params.payload.deviceID ,
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
        console.log ( '\n CA after create  hook.result :' + JSON.stringify ( hook.result ) )
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
