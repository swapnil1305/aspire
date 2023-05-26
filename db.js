 const mongoose = require('mongoose')
 
 //create a user schema
  const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
  });
  const User = mongoose.model('User', userSchema);

  module.exports = User;