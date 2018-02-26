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
        const identityServer = hook.app.get ( 'identityServer' )
        const csrtUri = identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.csrt )
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        const omitSubscriberMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const certs = await axios.post ( csrtUri , data , axiosConfig );
        const subscriber = await hook.app.service ( 'subscribers' ).find ( { query : { id : hook.data.id } } );
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
      hook => {
        hook.result = omitMeta(hook.data)
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
