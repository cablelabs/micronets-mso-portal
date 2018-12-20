const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const propEq = require ( 'ramda/src/propEq' );
const findIndex = require ( 'ramda/src/findIndex' );
const path = require('ramda/src/path');
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const errors = require('@feathersjs/errors');
const logger = require ( './../../logger' );

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      async( hook ) => {
        const { params , data , payload } = hook;
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ]
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        const registryUrl = hook.app.get ( 'registryServer' )
        // hook.app.service('ca/csrt').find({ query : { debug :{ context : { token: params.headers.authorization.split(' ')[1] } } }})
        const certList = await hook.app.service ( 'ca/csrt' ).find ()
        let result = certList.data.map ( ( cert, index ) => {
          const tokenIndex = findIndex ( propEq ( 'token' , jwtToken ) ) ( cert )
          const getToken = path(['debug', 'context', 'token'])
          if ( getToken(cert).toString() == jwtToken.toString() ) {
            return {
              tokenIndex : index ,
              subscriberId : cert.debug.context.subscriber.id
            }
          }
        } )
        result = result.filter ( ( e ) => { return e } )
        let registry = await axios.get ( `${registryUrl}/mm/v1/micronets/registry/${result[0].subscriberId}` , axiosConfig )
        let mmApiurl = registry.data.mmUrl
        logger.debug( '\n Registry from MM :' + JSON.stringify ( registry.data ) )
        const mmApiResponse = await axios.post ( `${mmApiurl}/mm/v1/micronets/certificates` , {data, subscriberId:result[0].subscriberId} , axiosConfig );
        logger.debug( '\n MM API Response Certs  :' + JSON.stringify ( mmApiResponse.data ) )
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
        console.log('\n\n Certificates  : ' + JSON.stringify(hook.result))
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
