const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [
      hook => {
        const { data , params , payload , sessionData } = hook;
      }
    ] ,
    get : [
      hook => {
        const { data , params , payload } = hook;
        return hook.app.service('/portal/session').find({ query: { deviceId: params.payload.deviceID } })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
          });
      }
    ] ,
    create : [
      hook => {
        const { data , params , payload } = hook;
        const jwtToken = params.headers.authorization.split ( ' ' )[ 1 ];
        hook.data = Object.assign ( {} , {
          subscriberId : data.subscriberId,
            clientId:params.payload.clientID,
            deviceId:params.payload.deviceID,
            macAddress:params.payload.macAddress,
        })
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
        const { params , data , payload } = hook
        hook.result = omitMeta ( hook.data )
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
