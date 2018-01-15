// ca-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const ca = new Schema({
    csrTemplate: { type: String, required: true },
    debug:{ type:Object , required:false }
  }, {
    timestamps: true
  });

  return mongooseClient.model('ca', ca);
};
