const logger = require ( './../../api/logger' );
const Cookies = require('cookies')

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters
  const app = this; // eslint-disable-line no-unused-vars
  const keys = app.get('cookieSecret')
  app.use(function(req, res, next) {
    const { headers, originalUrl, body } = req
    const cookies = new Cookies(req, res, { keys: keys })
    logger.debug('\n MSO middleware headers : ' + JSON.stringify(headers) + '\t\t originalUrl : ' + JSON.stringify(originalUrl))
    req.feathers.requestHeaders = headers;
    req.feathers.requestUrl = originalUrl
    req.feathers.requestBody = body;
    req.feathers.jar =  cookies
    next();
  });
};
