const mongoose = require('mongoose');
require('dotenv').config();

const fileSchema = mongoose.Schema({
    originalName: { type: String, required: true },
    fileLink: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const userSchema = mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  files: [fileSchema],
});
  
const User = mongoose.model('UserFileUploader', userSchema);

module.exports = User

module.exports.saveUser = (data) => {
    const user = new User(data)
    return user.save()
    .then(() => {
      console.log("User saved successfully");
    })
    .catch((err) => {
      console.error(err);
    })
}