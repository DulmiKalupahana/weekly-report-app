require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    let user = await User.findOne({ email: 'manager@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'manager'
      });
      console.log('created', user._id.toString());
    } else {
      console.log('existing', user.role);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
