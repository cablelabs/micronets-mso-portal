const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
var axios = require ( 'axios' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
const PROD_ENV = "production"

module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [
      // (hook) => {
      //   const {data, params, payload } = hook
      //   console.log('\n ca.hook before find data : ' + JSON.stringify(data))
      //   console.log('\n ca.hook before find params : ' + JSON.stringify(params))
      //   console.log('\n ca.hook before find payload : ' + JSON.stringify(payload))
      //   console.log('\n ca.hook before find hook.params.query : ' + JSON.stringify(hook.params.query))
      //   hook.params.mongoose = {
      //     runValidators: true,
      //     setDefaultsOnInsert: true
      //   }
      //   const query = hook.params.query
      //   console.log('\n query in ca.hook find before create : ' + JSON.stringify(query))
      //   if(query.debug.context.token.$search) {
      //     query.debug.context.token =  { $regex: new RegExp(query.debug.context.token.$search) }
      //   }
      // }
    ] ,
    get : [] ,
    create : [
      async function ( hook ) {
        const { params , data , payload } = hook;
        const subscriberId = hook.data.subscriberID
        console.log('\n\n CA Hook params.headers.authorization : ' + JSON.stringify(params.headers.authorization))
        let axiosConfig = { headers : { 'Authorization' : params.headers.authorization } };
        console.log('\n CA hook data : ' + JSON.stringify(data))
        console.log('\n CA hook subscriberId : ' + JSON.stringify(subscriberId))
        console.log('\n CA hook params : ' + JSON.stringify(params))
        const registryUrl = hook.app.get ( 'registryServer' )
        console.log('\n registry server url : ' + JSON.stringify(registryUrl))
        let registry = await axios.get ( `${registryUrl}/mm/v1/micronets/registry/${subscriberId}`, axiosConfig )
        console.log('\n Registry obtained from server : ' + JSON.stringify(registry.data))
        let mmApiurl = registry.data.mmUrl
        console.log('\n CA hook mmApiurl : ' + JSON.stringify(mmApiurl))
        console.log('\n CA hook data : ' + JSON.stringify(data))
        console.log('\n CA hook registryUrl : ' + JSON.stringify(registryUrl))
        const mmApiResponse = await axios.post ( `${mmApiurl}/mm/v1/micronets/csrt` , { "subscriberId":subscriberId, registryUrl } , axiosConfig );
        console.log('\n mmApiResponse : ' + JSON.stringify(mmApiResponse.data))
        hook.data = Object.assign ( {} ,
            {
              csrTemplate : mmApiResponse.data.csrTemplate ,
              debug : {
                context : {
                  token : mmApiResponse.data.debug.context.token ,
                  clientID : mmApiResponse.data.debug.context.clientID ,
                  deviceID : mmApiResponse.data.debug.context.deviceID ,
                  class : mmApiResponse.data.debug.context.class,
                  timestamp : mmApiResponse.data.debug.context.timestamp ,
                  subscriber : Object.assign ( {} ,mmApiResponse.data ? omitMeta ( mmApiResponse.data.debug.context.subscriber ) : { info : 'No subscriber found' } )
                }
              }
            } );
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
        hook.result = omitMeta ( hook.data )
        console.log ( '\n CA hook result :' + JSON.stringify ( hook.result ) )
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
