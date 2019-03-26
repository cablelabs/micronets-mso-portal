const { authenticate } = require ( '@feathersjs/authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [
      hook => {
        const {params, id} = hook
        const query = Object.assign({ id: id ? id : params.id }, hook.params.query);
        return hook.app.service('/portal/v1/session').find({ query })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
          });
      }
    ] ,
    create : [
      ( hook ) => {
        const { data , params, app } = hook;
        hook.data = Object.assign ( {} , {
          id : data.subscriberId ,
          name : data.name ,
          ssid : data.ssid ,
          devices : [ Object.assign ( {} , {
            clientId : params.payload.clientID ,
            deviceId : params.payload.deviceID ,
            macAddress : params.payload.macAddress,
            class: params.payload.class
          } ) ]
        } );
        app.service ( '/portal/v1/session' ).emit ( 'sessionCreate' , {
          type : 'sessionCreate' ,
          data : { subscriberId : hook.data.id , device: Object.assign({}, { deviceId:params.payload.deviceID , class:params.payload.class, macAddress:params.payload.macAddress }) }
        } );
      }
    ] ,
    update : [] ,
    patch : [
      hook => {
        const { id, app } = hook;
        hook.params.mongoose = {
          runValidators: true,
          setDefaultsOnInsert: true
        }
        const eventData = Object.assign({},{deviceId:hook.data.deviceId , class:hook.data.class, macAddress:hook.data.macAddress})
        const query = Object.assign({ id: id ? id : hook.params.id }, hook.params.query);
        return hook.app.service ( '/portal/v1/session' ).find (  {query}  )
          .then ( ( { data } ) => {
            const originalSession = data[ 0 ];
            const foundDeviceIndex = originalSession.devices.findIndex( device => device.clientId ==  hook.data.clientId && device.deviceId == hook.data.deviceId && device.macAddress == hook.data.macAddress && device.class == hook.data.class);
            if(foundDeviceIndex >= 0 ) {
              return Promise.resolve(hook);
            }

            if(foundDeviceIndex == -1 ) {
              let updatedSession = Object.assign ( {} , originalSession , originalSession.devices.push ( hook.data ) );
              hook.data = Object.assign ( {} , updatedSession );
              app.service ( '/portal/v1/session' ).emit ( 'sessionUpdate' , {
                type : 'sessionUpdate' ,
                data : { subscriberId : hook.data.id , device : eventData }
              } );
            }
          } );
      }
    ] ,
    remove : []
  } ,

  after : {
    all : [] ,
    find : [] ,
    get : [] ,
    create : [
      hook => {
        const { params , data , payload, app } = hook;
        hook.result = omitMeta ( hook.data );
      }
    ] ,
    update : [

    ] ,
    patch : [
      hook => {
        const {id, params, payload} = hook
        hook.result = omitMeta ( hook.data );
      }
    ] ,
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
