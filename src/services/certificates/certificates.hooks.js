const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var fs = require ( 'fs' );
var path = require ( 'path' );
var axios = require ( 'axios' );

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async function(hook) {
        const { data , params } = hook;
        var csrPem = fs.readFileSync ( path.join ( __dirname , "../../../sandbox/" , "micronet.csr" ) );
        // console.log('\n csrPem : ' + (csrPem))
        const omitSubscriberMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        // Since hook.app.service('subscribers').get returns a promise we can `await` it
        const subscriber = await hook.app.service('subscribers').find ( { query : { id : hook.data.id } } );
        const identityServer = hook.app.get('identityServer')
        const certificatesUri = identityServer.host.concat(':').concat(identityServer.port).concat('/certificates')
        const certs = await axios.post ( certificatesUri , data , axiosConfig );
        hook.result = Object.assign({},{ wifiCert:certs.data.wifiCert , caCert:certs.data.caCert , subscriber: Object.assign({},subscriber.data.length > 0 ? omitSubscriberMeta(subscriber.data[0]) : { info:'No subscriber found' } )})
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
