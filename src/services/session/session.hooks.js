const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
     (hook) => {
        const { data , params , payload } = hook;
          hook.data = Object.assign ( {} , {
            id : data.subscriberId ,
            devices : [ Object.assign ( {} , {
              clientId : params.payload.clientID ,
              deviceId : params.payload.deviceID ,
              macAddress : params.payload.macAddress
            })]
          })
      }
    ] ,
    update : [
      hook => {
       const {  params , id } = hook;
        return hook.app.service('/portal/session').find({ query: { id: id } })
          .then( ({ data }) => {
            const originalSession = data[0];
            let updatedSession = Object.assign({} , originalSession , originalSession.devices.push(hook.data));
            hook.data = Object.assign({}, updatedSession )
          });
      }
    ] ,
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
