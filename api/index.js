/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('listenPort');
const host = app.get('listenHost');
const webSocketBaseUrl = app.get('webSocketBaseUrl')
const publicApiBaseUrl = app.get('publicApiBaseUrl')
const server = app.listen(port,host);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () => {
  address = server.address()
  logger.info ('Feathers application started on ' + JSON.stringify(`http://${address.address}:${address.port}`))
  logger.info ('Feathers  webSocketBaseUrl ' + JSON.stringify(webSocketBaseUrl))
  logger.info ('Feathers  publicApiBaseUrl ' + JSON.stringify(publicApiBaseUrl))
});




