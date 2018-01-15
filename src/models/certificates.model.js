// certificates-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const certificates = new Schema({
    subscriber: { type: Object, required: true },
    wifiCert: { type: Object, required: true },
    caCert: { type: Object, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('certificates', certificates);
};
