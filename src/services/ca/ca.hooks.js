const { authenticate } = require ( 'feathers-authentication' ).hooks;
const { findIndex , propEq , find , lensPath , view , set } = require ( 'ramda' );
const omit = require ( 'ramda/src/omit' );
var axios = require ( 'axios' );

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async function ( hook ) {
        const { params , data , payload } = hook;
        const identityServer = hook.app.get ( 'identityServer' )
        const csrtUri = identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( '/csrt' )
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        const omitSubscriberMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const certs = await axios.post ( csrtUri , data , axiosConfig );
        const subscriber = await hook.app.service ( 'subscribers' ).find ( { query : { id : hook.data.id } } );
        hook.result = Object.assign ( {} ,
          { csrTemplate : certs.data.csrTemplate,
            debug: {
                context : {
                  token : jwtToken ,
                  clientID : params.payload.clientID ,
                  deviceID : params.payload.deviceID ,
                  timestamp : params.payload.iat ,
                  subscriber : Object.assign ( {} , subscriber.data.length > 0 ? omitSubscriberMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } )
                }
          }});
        return hook;
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
    create : [] ,
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
