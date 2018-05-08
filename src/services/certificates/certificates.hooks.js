const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const propEq = require ( 'ramda/src/propEq' );
const findIndex = require ( 'ramda/src/findIndex' );
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
        const { data , params } = hook;
        console.log('\n\n Certificates hook data : ' + JSON.stringify(data) + '\t\t Params : ' + JSON.stringify(params))
        //var csrPem = fs.readFileSync ( path.join ( __dirname , "../../../sandbox/" , "micronet.csr" ) );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const sessionsList = await hook.app.service ( '/portal/session' ).find ();
        console.log('\n Certificates all sessions : ' + JSON.stringify(sessionsList))
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
        const identityServer = process.env.NODE_ENV == PROD_ENV ? hook.app.get ( 'identity_server_url' ) : hook.app.get ( 'identityServer' )
        const certificatesUri = process.env.NODE_ENV != PROD_ENV ? identityServer.host.concat ( ':' ).concat ( identityServer.port ).concat ( identityServer.certificates ) : identityServer
        console.log('\n Identity server uri : ' + JSON.stringify(identityServer))
        console.log('\n Certificates server uri : ' + JSON.stringify(certificatesUri))
        const certs = await axios.post ( certificatesUri , data , axiosConfig );
        console.log('\n\n Certificates from identity server : ' + JSON.stringify(certs.data))
        // const finalSubscriber = Object.assign ( {} , subscriber.data.length > 0 ? omitMeta ( subscriber.data[ 0 ] ) : { info : 'No subscriber found' } );
        hook.data = Object.assign ( {} ,
          {
            wifiCert : certs.data.wifiCert ,
            caCert : certs.data.caCert ,
            passphrase: certs.data.passphrase,
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
        console.log('\n\n Certificates hook result : ' + JSON.stringify(hook.result))
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
