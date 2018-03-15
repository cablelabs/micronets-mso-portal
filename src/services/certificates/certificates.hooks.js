const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var fs = require ( 'fs' );
var path = require ( 'path' );
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async function ( hook ) {
        const { data , params } = hook;
        var csrPem = fs.readFileSync ( path.join ( __dirname , "../../../sandbox/" , "micronet.csr" ) );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        // Since hook.app.service('subscribers').get returns a promise we can `await` it
        const session = await hook.app.service ( '/portal/session' ).find ( { query : { token : params.headers.authorization } } );
        const subscriberId = session.data[ 0 ].subscriberId;
        const subscriber = await hook.app.service ( '/internal/subscriber' ).find ( { query : { id : session.data[ 0 ].subscriberId } } );
        const identityServer = hook.app.get ( 'identityServer' )
        const identityServerUrl = hook.app.get ( 'identity_server_url' )
        //const certificatesUri = identityServer.host.concat(':').concat(identityServer.port).concat(identityServer.certificates)
        const certificatesUri = identityServerUrl.concat ( identityServer.certificates )
        console.log ( '\n Certificates certificatesUri : ' + JSON.stringify ( certificatesUri ) )
        const certs = await axios.post ( certificatesUri , data , axiosConfig );
        const finalSubscriber = Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } );
        hook.data = Object.assign ( {} ,
          {
            wifiCert : certs.data.wifiCert ,
            caCert : certs.data.caCert ,
            subscriber : Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } )
          } )
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
        hook.result = omitMeta ( hook.data )
        console.log ( '\n Certificates after create hook.result :' + JSON.stringify ( hook.result ) )
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
