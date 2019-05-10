const logger = require ( './../../api/logger' );
module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters
  const app = this; // eslint-disable-line no-unused-vars
  app.use(function(req, res, next) {
    const { headers, originalUrl } = req
    logger.debug('\n MSO middleware headers : ' + JSON.stringify(headers) + '\t\t originalUrl : ' + JSON.stringify(originalUrl))
    req.feathers.requestHeaders = headers;
    req.feathers.requestUrl = originalUrl
    next();
  });
};
