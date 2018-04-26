const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const propEq = require ( 'ramda/src/propEq' );
const findIndex = require ( 'ramda/src/findIndex' );
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
        //var csrPem = fs.readFileSync ( path.join ( __dirname , "../../../sandbox/" , "micronet.csr" ) );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const sessionsList = await hook.app.service ( '/portal/session' ).find ();
        let result = sessionsList.data.map ( ( session , sessionIndex ) => {
        const deviceIdIndex = findIndex ( propEq ( 'deviceId' , params.payload.deviceID ) ) ( session.devices )
          if ( deviceIdIndex > -1 ) {
            return {
              sessionIndex : sessionIndex ,
              deviceIdIndex : deviceIdIndex ,
              subscriberId : sessionsList.data[ sessionIndex ].id
            }
          }
        } )
        result = result.filter ( ( e ) => { return e } )
        let subscriber = await hook.app.service ( '/internal/subscriber' ).find ( { query : { id : result[ 0 ].subscriberId } } );
        const identityServer = hook.app.get ( 'identityServer' )
        const identityServerUrl = hook.app.get ( 'identity_server_url' )
        const certificatesUri = identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.certificates )
        //const certificatesUri = identityServerUrl.concat ( identityServer.certificates )
        const certs = await axios.post ( certificatesUri , data , axiosConfig );
        // const finalSubscriber = Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } );
        hook.data = Object.assign ( {} ,
          {
            wifiCert : certs.data.wifiCert ,
            caCert : certs.data.caCert ,
            macAddress : params.payload.macAddress ,
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
        hook.app.service ( '/ca/cert' ).emit ( 'certGenerated' , {
          type : 'certGenerated' ,
          data : { subscriber : hook.data.subscriber , macAddress : hook.data.macAddress }
        } );

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
