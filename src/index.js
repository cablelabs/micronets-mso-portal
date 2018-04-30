/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const io = require('socket.io').listen(server);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d for environment %s', app.get('host'), port, JSON.stringify(process.env.NODE_ENV))
);

io.on('connection' , (() => logger.info('Socket io working in featherjs socket :')))

io.on('connection' , (socket) => {
  app.service('/portal/session').on('sessionCreate' ,(data) => {
    socket.emit('socketSessionCreate', { data: {
      type : 'socketSessionCreate' ,
      subscriberId : data.id
    }});
  });
  app.service('/portal/session').on('sessionUpdate' ,(data) => {
    socket.emit('socketSessionUpdate', { data:{
      type : 'socketSessionUpdate' ,
      subscriberId : data.id
    }});
  });
});
