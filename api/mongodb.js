const MongoClient = require('src/mongodb').MongoClient;

module.exports = function () {
  const app = this;
  const config = app.get('mongodb');
  console.log('\n Mongodb config : ' + JSON.stringify(config))
  const promise = MongoClient.connect(config);

  app.set('mongoClient', promise);
};
