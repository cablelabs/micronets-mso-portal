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
        console.log('\n Get hook session query : ' + JSON.stringify(query))
        return hook.app.service('/portal/session').find({ query })
          .then( ({ data }) => {
            hook.result = omitMeta(data[0]);
            console.log('\n hook.result  : ' + JSON.stringify(hook.result));
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
        app.service ( '/portal/session' ).emit ( 'sessionCreate' , {
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
        console.log('\n Session patch method hook.data : ' + JSON.stringify(hook.data))
        const eventData = Object.assign({},{deviceId:hook.data.deviceId , class:hook.data.class, macAddress:hook.data.macAddress})
        console.log('\n EventData : ' + JSON.stringify(eventData))
        const query = Object.assign({ id: id ? id : hook.params.id }, hook.params.query);
        return hook.app.service ( '/portal/session' ).find (  {query}  )
          .then ( ( { data } ) => {
            const originalSession = data[ 0 ];
            console.log('\n Original Session : ' + JSON.stringify(originalSession))
            const foundDeviceIndex = originalSession.devices.findIndex( device => device.clientId ==  hook.data.clientId && device.deviceId == hook.data.deviceId && device.macAddress == hook.data.macAddress && device.class == hook.data.class);
            console.log('\n Hook session foundDeviceIndex : ' + JSON.stringify(foundDeviceIndex))

            if(foundDeviceIndex >= 0 ) {
              console.log('\n Nothing to do.Device already present')
              return Promise.resolve(hook);
            }

            if(foundDeviceIndex == -1 ) {
              let updatedSession = Object.assign ( {} , originalSession , originalSession.devices.push ( hook.data ) );
              console.log ( '\n Updated Session : ' + JSON.stringify ( updatedSession ) )
              hook.data = Object.assign ( {} , updatedSession );
              app.service ( '/portal/session' ).emit ( 'sessionUpdate' , {
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
        console.log('\n Update create after hook Params : ' + JSON.stringify(params) + '\t\t Data : ' + JSON.stringify(data) + '\t\t\t Payload : ' + JSON.stringify(payload))
        console.log('\n Update create after hook hook.data : ' + JSON.stringify(hook.data))
        hook.result = omitMeta ( hook.data );
        console.log('\n Session hook result : ' + JSON.stringify(hook.result));
      }
    ] ,
    update : [

    ] ,
    patch : [
      hook => {
        const {id, params, payload} = hook
        console.log('\n Session patch after hook PARAMS : ' + JSON.stringify(params) + '\t\t ID : ' + JSON.stringify(id) + '\t\t\t PAYLOAD : ' + JSON.stringify(payload))
        hook.result = omitMeta ( hook.data );
        console.log('\n Session patch after hook result : ' + JSON.stringify(hook.result));
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
