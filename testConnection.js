require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB');
    console.error(err);
    process.exit(1);
  });