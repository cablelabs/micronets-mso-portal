// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const users = new Schema({
    token: { type: String, required: true },
    lastUpdatedAt: { type: Date, default: Date.now },
    lastUpdatedBy: { type: String },
    isVerified: { type: Boolean },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date },
    clientID: { type: String , required: true  },
    deviceID: { type: String , required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};
