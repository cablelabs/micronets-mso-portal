const local = require('@feathersjs/authentication-local');
const saltRounds = 10;
const bcrypt = require('bcrypt');
var auth = require('basic-auth')
const errors = require('@feathersjs/errors');
const notFound = new errors.NotFound('User does not exist');

module.exports = {
  before: {
    all: [  ],
    find: [
    async(hook) => {
    const { params } = hook
}
    ],
    get: [
     async(hook) => {
       const { params , id } = hook
       const user = auth.parse ( params.headers.authorization )
       let dbUsers = await hook.app.service ( `authorize/subscribers` ).find ( {} )
       dbUsers = dbUsers.data
       let userIndex = dbUsers.findIndex ( ( dbuser , index ) => dbuser.username == user.name && id == dbuser.username )
       if(userIndex == -1 ){
         return Promise.reject(notFound)
       }
       const match = await bcrypt.compare(user.pass, dbUsers[userIndex].password);
       if(match) {
         hook.result = Object.assign({}, dbUsers[userIndex])
         return Promise.resolve(hook)
       }
       else {
         return Promise.reject(notFound)
       }
     }
    ],
    create: [
      async(hook) => {
      const { data , params } = hook;
      let hashPwd = bcrypt.hashSync(data.password, saltRounds);
      hook.data = Object.assign({},{
        sub:data.sub,
        username:data.username,
        password:hashPwd
      })
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ local.hooks.protect('password') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
