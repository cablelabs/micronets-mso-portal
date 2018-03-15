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
        console.log('\n CA hook DATA : ' + JSON.stringify(data) + '\t\t PARAMS : ' + JSON.stringify(params))
        const identityServer = hook.app.get ( 'identityServer' );
        const identityServerUrl = hook.app.get ( 'identity_server_url' )
        //const csrtUri = identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.csrt )
        const csrtUri = identityServerUrl.concat ( identityServer.csrt )
        console.log('\n CA csrtUri : ' + JSON.stringify(csrtUri))
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const certs = await axios.post ( csrtUri , data , axiosConfig );
        const subscriber = await hook.app.service ( '/internal/subscriber' ).find ( { query : { id : hook.data.subscriberID } } );
        console.log('\n CA HOOK BEFORE CREATE SUBSCRIBER :' + JSON.stringify(subscriber))
        const session = await hook.app.service ( '/portal/session' ).create({token:jwtToken, subscriberId:subscriber.data[ 0 ].id})
        console.log('\n session : ' + JSON.stringify(session));
        hook.data = Object.assign ( {} ,
          { csrTemplate : certs.data.csrTemplate,
            debug: {
              context : {
                token : jwtToken ,
                clientID : params.payload.clientID ,
                deviceID : params.payload.deviceID ,
                timestamp : params.payload.iat ,
                subscriber : Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } )
              }
            }});
        console.log('\n CA HOOK BEFORE CREATE  hook.data :' + JSON.stringify( hook.data))
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
        hook.result = omitMeta(hook.data)
        console.log('\n CA HOOK AFTER CREATE  hook.result :' + JSON.stringify( hook.result))
        //console.log('\n CA HOOK AFTER CREATE  hook.result.SUBSCRIBER : ' + JSON.stringify( hook.result.debug.context.subscriber))
        //const session = await hook.app.service ( '/portal/session' ).create({token:hook.result.debug.context.token, subscriberId:hook.result.debug.context.subscriber.id})
        //console.log('\n session : ' + JSON.stringify(session));
        //console.log('\n CA HOOK params.headers.authorization : ' + JSON.stringify(params.headers.authorization.split(' ')[1]))
        //const sessionRetrieved = await hook.app.service('/portal/session').find ( { query : { token : params.headers.authorization } } );
        //console.log('\n Retrieved session in CA : ' + JSON.stringify(sessionRetrieved))
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
