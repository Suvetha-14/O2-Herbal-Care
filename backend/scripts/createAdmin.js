import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not set in environment variables');
      process.exit(1);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const adminPhone = process.env.ADMIN_PHONE || '9999999999';

    if (!adminEmail || !adminPassword) {
      console.error(
        '❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD in your environment (.env) before running this script.'
      );
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log(`✅ Admin user (${adminEmail}) credentials successfully updated/synced.`);
      process.exit(0);
    }

    const adminUser = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword, // pre-save hook will hash this securely with bcrypt
      phone: adminPhone,
      role: 'admin',
    });

    await adminUser.save();
    console.log(`✅ Admin user created successfully for: ${adminEmail}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
