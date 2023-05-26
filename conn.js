const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/employeePortal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB database!');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

  module.exports = mongoose;

