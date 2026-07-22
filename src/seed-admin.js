import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const SUPER_ADMIN = {
  name: 'Super Admin',
  email: 'admin@dgdelightfound.org',
  password: 'Admin@2026',
  role: 'super_admin',
  status: 'active',
};

/**
 * Seeds the first super_admin account.
 * Run with: node src/seed.js
 */
async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'dgdelightfound_db',
  });

  const email = SUPER_ADMIN.email.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    let updated = false;
    if (existing.role !== 'super_admin') {
      existing.role = 'super_admin';
      updated = true;
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
      updated = true;
    }
    if (!existing.name?.trim()) {
      existing.name = SUPER_ADMIN.name;
      updated = true;
    }
    if (updated) {
      await existing.save();
      console.log(`Updated existing user to super_admin: ${email}`);
    } else {
      console.log(`Super admin already exists: ${email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const user = await User.create(SUPER_ADMIN);
  console.log(
    `Super admin created: ${email} (id: ${user._id}) role=${user.role}`
  );
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
