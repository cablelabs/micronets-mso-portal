/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const io = require('socket.io')(server);


process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info ('Feathers application started on http://%s:%d', app.get('host'), port)
);


app.service('/portal/v1/session').on('sessionCreate' ,(data) => {
  console.log('\n FeatherJS event sessionCreate fired with data : ' + JSON.stringify(data));
  io.on('connection' , (socket) => {
    console.log('Socket IO connection ' + JSON.stringify(socket.id));
    socket.emit('socketSessionCreate', data);
    socket.on('disconnect', () => {
      console.log('\n Socket IO disconnect' + JSON.stringify(socket.id))
      socket.removeAllListeners('send message');
      socket.removeAllListeners('disconnect');
      socket.removeAllListeners('connection');
      socket.disconnect( true );
    });
  });
});

app.service('/portal/v1/session').on('sessionUpdate' ,(data) => {
  console.log ( '\n FeatherJS event sessionUpdate fired with data : ' + JSON.stringify ( data ) );
  io.on ( 'connection' , ( socket ) => {
    console.log ( 'Socket IO connection ' + JSON.stringify ( socket.id ) );
    socket.emit ( 'socketSessionUpdate' , data );
    socket.on('disconnect', () => {
      console.log('\n Socket IO disconnect' + JSON.stringify(socket.id))
      socket.removeAllListeners('send message');
      socket.removeAllListeners('disconnect');
      socket.removeAllListeners('connection');
      socket.disconnect( true );
    });
  });
})


