const MongoClient = require('src/mongodb').MongoClient;
const logger = require('./logger');
module.exports = function () {
  const app = this;
  let dbConfig = ''
  // if(process.env.NODE_ENV == 'development' && process.env.NETWORK_MODE == 'false') {
  //   logger.info('MONGODB URI : ' + JSON.stringify(app.get('mongodbDocker')) + '\t\t  ENV : ' + JSON.stringify(process.env.NODE_ENV) + '\t\t NETWORK_MODE : ' + JSON.stringify(process.env.NETWORK_MODE));
  //   dbConfig = app.get('mongodbDocker');
  // }
  // else {
  //   logger.info('MONGODB URI : ' + JSON.stringify(app.get('mongodb')) + '\t\t  ENV : ' + JSON.stringify(process.env.NODE_ENV));
  //   dbConfig = app.get('mongodb');
  // }
  // const promise = MongoClient.connect(dbConfig);

  mongodb_uri = app.get('mongodb');
  logger.info('MONGODB URI : ' + JSON.stringify(mongodb_uri))
  app.set('mongoClient', promise);
};
