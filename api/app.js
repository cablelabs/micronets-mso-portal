const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const rest = require('@feathersjs/express/rest');
// const socketio = require('@feathersjs/socketio');
const handler = require('@feathersjs/express/errors');
const errors = require('@feathersjs/errors');
const notFound = new errors.NotFound('404. Page not found')
const middleware = require('./middleware/index');
const services = require('./services/index');
const appHooks = require('./app.hooks');

const authentication = require('./authentication');
const mongoose = require('./mongoose');

const app = express(feathers());
// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.configure(rest());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  const { headers, originalUrl } = req
  req.feathers.requestHeaders = headers;
  req.feathers.requestUrl = originalUrl
  next();
});

app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

app.configure(mongoose);

// app.configure(socketio());
app.configure(authentication);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure a middleware for 404s and the error handler
// app.use(new errors.NotFound());
app.use(handler());
app.hooks(appHooks);

module.exports = app;
