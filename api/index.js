/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const io = require('socket.io')(server);
const openSocket = require('socket.io-client')
const registrySocket = openSocket(app.get('registryServer'));
const paths = require('./hooks/servicePaths')
const {  REGISTER_PATH } = paths
process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info ('Feathers application started on ' + JSON.stringify(`http://${app.get('host')}:${app.get('port')}`))
);

registrySocket.on('DPPOnboardingStartedEvent', async(message)=> {
  console.log ( 'DPPOnboardingStartedEvent ' + JSON.stringify ( message ) );
  registrySocket.emit('DPPOnboardingStartedEvent', message)
})

registrySocket.on('DPPOnboardingProgressEvent', async(message)=> {
  console.log ( 'DPPOnboardingProgressEvent ' + JSON.stringify ( message ) );
  registrySocket.emit('DPPOnboardingProgressEvent', message)
})

registrySocket.on('DPPOnboardingCompleteEvent', async(message)=> {
  console.log ( 'DPPOnboardingCompleteEvent ' + JSON.stringify ( message ) );
  registrySocket.emit('DPPOnboardingCompleteEvent', message)
})

registrySocket.on('DPPOnboardingFailedEvent', async(message)=> {
  console.log ( 'DPPOnboardingFailedEvent ' + JSON.stringify ( message ) );
  registrySocket.emit('DPPOnboardingFailedEvent', message)
})

// app.service(`${REGISTER_PATH}`).on('registryCreate' ,(data) => {
//   console.log('\n FeatherJS event registryCreate fired with data : ' + JSON.stringify(data));
//   const registrySocket = openSocket(data.registry);
//   registrySocket.on('DPPOnboardingStartedEvent', async(message)=> {
//     console.log ( 'DPPOnboardingStartedEvent ' + JSON.stringify ( message ) );
//     registrySocket.emit('DPPOnboardingStartedEvent', message)
//   })
//
//   registrySocket.on('DPPOnboardingProgressEvent', async(message)=> {
//     console.log ( 'DPPOnboardingProgressEvent ' + JSON.stringify ( message ) );
//     registrySocket.emit('DPPOnboardingProgressEvent', message)
//   })
//
//   registrySocket.on('DPPOnboardingCompleteEvent', async(message)=> {
//     console.log ( 'DPPOnboardingCompleteEvent ' + JSON.stringify ( message ) );
//     registrySocket.emit('DPPOnboardingCompleteEvent', message)
//   })
//
//   registrySocket.on('DPPOnboardingFailedEvent', async(message)=> {
//     console.log ( 'DPPOnboardingFailedEvent ' + JSON.stringify ( message ) );
//     registrySocket.emit('DPPOnboardingFailedEvent', message)
//   })
//
// });




