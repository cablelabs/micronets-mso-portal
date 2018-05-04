const { authenticate } = require ( 'feathers-authentication' ).hooks;
const omit = require ( 'ramda/src/omit' );
const omitMeta = omit ( [ 'updatedAt' , 'createdAt' , '_id' , '__v' ] );
module.exports = {
  before : {
    all : [ authenticate ( 'jwt' ) ] ,
    find : [] ,
    get : [] ,
    create : [
      ( hook ) => {
        const { data , params } = hook;
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
        hook.app.service ( '/portal/session' ).emit ( 'sessionCreate' , {
          type : 'sessionCreate' ,
          data : { subscriberId : hook.data.id  }
        } );
      }
    ] ,
    update : [
      hook => {
        const { id } = hook;
        return hook.app.service ( '/portal/session' ).find ( { query : { id : id } } )
          .then ( ( { data } ) => {
            const originalSession = data[ 0 ];
            console.log('\n Original Session : ' + JSON.stringify(originalSession))
            let updatedSession = Object.assign ( {} , originalSession , originalSession.devices.push ( hook.data ) );
            console.log('\n Updated Session : ' + JSON.stringify(updatedSession))
            hook.data = Object.assign ( {} , updatedSession );
            hook.app.service ( '/portal/session' ).emit ( 'sessionUpdate' , {
              type : 'sessionUpdate' ,
              data : { subscriberId : hook.data.id  }
            } );
          } );
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
        const { params , data , payload } = hook;
        hook.result = omitMeta ( hook.data );
        console.log('\n Session hook result : ' + JSON.stringify(hook.result))
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
