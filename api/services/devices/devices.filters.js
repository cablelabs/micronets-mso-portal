/* eslint no-console: 1 */
console.warn('You are using the default filter for the devices service. For more information about event filters see https://docs.feathersjs.com/api/events.html#event-filtering'); // eslint-disable-line no-console

module.exports = function (data, connection, hook) { // eslint-disable-line no-unused-vars
  return connection.user._id === data._id && data
};
