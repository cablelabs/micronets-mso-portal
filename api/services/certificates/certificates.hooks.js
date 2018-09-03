const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const propEq = require ( 'ramda/src/propEq' );
const findIndex = require ( 'ramda/src/findIndex' );
const path = require('ramda/src/path');
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
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ]
        console.log ( '\n MSO PORTAL CERTIFICATES HOOK TOKEN : ' + JSON.stringify ( jwtToken ) )
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        console.log ( '\n CA hook data : ' + JSON.stringify ( data ) )
        console.log ( '\n CA hook params : ' + JSON.stringify ( params ) )
        const registryUrl = hook.app.get ( 'registryServer' )
        console.log ( '\n registry server url : ' + JSON.stringify ( registryUrl ) )
        // hook.app.service('ca/csrt').find({ query : { debug :{ context : { token: params.headers.authorization.split(' ')[1] } } }})
        const certList = await hook.app.service ( 'ca/csrt' ).find ()
        // console.log ( '\n CertList from ca/csrt : ' + JSON.stringify ( certList.data ) )
        let result = certList.data.map ( ( cert, index ) => {
          console.log('\n Current cert : ' + JSON.stringify(cert))
          const tokenIndex = findIndex ( propEq ( 'token' , jwtToken ) ) ( cert )
          const getToken = path(['debug', 'context', 'token'])
          console.log('\n getToken from path : ' + JSON.stringify(getToken(cert)))
          console.log ( '\n tokenIndex : ' + JSON.stringify ( tokenIndex ) )
          if ( getToken(cert).toString() == jwtToken.toString() ) {
            console.log('\n Inside if for index : ' + JSON.stringify(index))
            return {
              tokenIndex : index ,
              subscriberId : cert.debug.context.subscriber.id
            }
          }
        } )

        result = result.filter ( ( e ) => { return e } )
        console.log('\n Obtained result : ' + JSON.stringify(result))

        let registry = await axios.get ( `${registryUrl}/mm/v1/micronets/registry/${result[0].subscriberId}` , axiosConfig )
        console.log ( '\n Registry obtained from server : ' + JSON.stringify ( registry.data ) )
        let mmApiurl = registry.data.mmUrl
        console.log ( '\n CA hook mmApiurl : ' + JSON.stringify ( mmApiurl ) )
        const mmApiResponse = await axios.post ( `${mmApiurl}/mm/v1/micronets/certificates` , {data, subscriberId:result[0].subscriberId} , axiosConfig );
        console.log ( '\n mmApiResponse : ' + JSON.stringify ( mmApiResponse.data ) )
        hook.data = Object.assign ( {} ,
          {
            wifiCert : mmApiResponse.data.wifiCert ,
            caCert : mmApiResponse.data.caCert ,
            passphrase : mmApiResponse.data.passphrase ,
            macAddress : mmApiResponse.data.macAddress ,
            subscriber : Object.assign ( {} , mmApiResponse.data ? omitMeta ( mmApiResponse.data.subscriber ) : { info : 'No subscriber found' } )
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
