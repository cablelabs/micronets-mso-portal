// devices-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema }  = mongooseClient;
  const devices = new Schema({
    lastUpdatedAt: { type: Date, default: Date.now },
    lastUpdatedBy: { type: String },
    id: { type: String , required: true, unique: true, primaryKey: true },
    ssid: { type: String, required: true },
    name: { type: String, required: true },
    mmUrl: { type: String, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('devices', devices);
};
