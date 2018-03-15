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
      async function(hook) {
        const { data , params } = hook;
        console.log('\n Certificates hook DATA : ' + JSON.stringify(data) + '\t\t PARAMS : ' + JSON.stringify(params))
        var csrPem = fs.readFileSync ( path.join ( __dirname , "../../../sandbox/" , "micronet.csr" ) );
        // console.log('\n csrPem : ' + (csrPem))
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        // Since hook.app.service('subscribers').get returns a promise we can `await` it
       // const subscriber = await hook.app.service(`/internal/subscriber/${hook.data.id}`);
        const session = await hook.app.service('/portal/session').find ( { query : { token : params.headers.authorization.split(' ')[1] } } );
        console.log('\n Retrieved session in Certificates : ' + JSON.stringify(session))
        const subscriberId = session.data[0].subscriberId;
        console.log('\n Retrieved subscriberId : ' + JSON.stringify(subscriberId))
        const subscriber = await hook.app.service('/internal/subscriber').find ( { query : { id : session.data[0].subscriberId } } );
        const identityServer = hook.app.get('identityServer')
        const identityServerUrl = hook.app.get ( 'identity_server_url' )
        //const certificatesUri = identityServer.host.concat(':').concat(identityServer.port).concat(identityServer.certificates)
        const certificatesUri = identityServerUrl.concat(identityServer.certificates)
        console.log('\n Certificates certificatesUri : '+ JSON.stringify(certificatesUri))
        console.log('\n Certificates hook before create subscriber : ' + JSON.stringify(subscriber))
        const certs = await axios.post ( certificatesUri , data , axiosConfig );
        const finalSubscriber = Object.assign({},subscriber.data.length > 0 ? omitMeta(subscriber.data[0]) : { info:'No subscriber found' } );
        console.log('\n finalSubscriber : ' + JSON.stringify(finalSubscriber))
        hook.data = Object.assign({},
          { wifiCert:certs.data.wifiCert , caCert:certs.data.caCert , subscriber: Object.assign({},subscriber.data.length > 0 ? omitMeta(subscriber.data[0]) : { info:'No subscriber found' } )})
          console.log('\n Certificates before hook hook.data : ' + JSON.stringify(hook.data))
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
        console.log('\n Certificates after create hook hook.result :' + JSON.stringify(hook.result))
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
