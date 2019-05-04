module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters
  const app = this; // eslint-disable-line no-unused-vars
  return function(req, res, next) {
    const {headers, originalUrl} = req
    req.feathers.requestHeaders = headers;
    req.feathers.requestUrl = originalUrl;
    next();
  }
};
