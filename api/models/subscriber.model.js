// subscriber-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const subscriber = new Schema({
    id: { type: String , required: true,  primaryKey: true, unique:true, sparse: true },
    ssid: { type: String, required: true },
    name: { type: String, required: true },
    gatewayId : {type: String, required: true },
    registry: { type: String, required: false, default: '' }
  }, {
    timestamps: true
  });
  return mongooseClient.model('subscriber', subscriber);

};
