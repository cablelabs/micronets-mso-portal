

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      hook => {
        return hook.app.service('internal/subscriber').find({ query: { id: hook.id } })
          .then( ({ data }) => { hook.result = data; });
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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
