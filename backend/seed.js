/**
 * seed.js — One-time script to create the first Admin user in the database.
 *
 * Usage:
 *   npm run seed
 *
 * This script is safe to run multiple times — it checks if the admin already
 * exists before creating one, so it will never create duplicates.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName     = process.env.ADMIN_NAME || 'TripBuddy Admin';

  // ─── Guard: ensure credentials exist in .env ────────────────────────────
  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ─── Check if admin already exists ──────────────────────────────────────
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('⚠️  Admin user already exists — skipping seed.');
      console.log(`   Email : ${existing.email}`);
      console.log(`   Role  : ${existing.role}`);
      console.log(`   Status: ${existing.status}`);
      return;
    }

    // ─── Create admin user ───────────────────────────────────────────────────
    // Note: bcrypt pre-save hook in User.js automatically hashes the password
    const admin = new User({
      fullName : adminName,
      email    : adminEmail,
      password : adminPassword,
      role     : 'admin',
      status   : 'approved', // admin can log in immediately, no approval needed
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('─────────────────────────────────────');
    console.log(`  Name  : ${adminName}`);
    console.log(`  Email : ${adminEmail}`);
    console.log(`  Role  : admin`);
    console.log(`  Status: approved`);
    console.log('─────────────────────────────────────');
    console.log('\n🔐 Save these credentials securely. They are stored hashed in the DB.');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seed();
