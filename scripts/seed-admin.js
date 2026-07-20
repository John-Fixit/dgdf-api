import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const email = (
  process.env.ADMIN_EMAIL || "admin@dgdelightfound.org"
).toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";

/**
 * Creates the first admin user if it does not already exist.
 */
async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "dgdelightfound_db",
  });

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists in dgdelightfound_db: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const user = await User.create({ email, password, role: "admin" });
  console.log(`Admin created in dgdelightfound_db: ${email} (id: ${user._id})`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
