// socket-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const socket = new Schema({
    socketUrl: { type: String, required: false, unique:true },
    gatewayId : {type: String, required: true, unique:true, primaryKey: true},
    subscriberId: { type: String , required: true, unique:true, sparse: true },
  }, {
    timestamps: true
  });

  return mongooseClient.model('socket', socket);
};
