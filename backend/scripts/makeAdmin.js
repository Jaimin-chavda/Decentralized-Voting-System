import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../server/models/User.js";

// Load environment variables from backend/.env
dotenv.config();

const makeAdmin = async () => {
  const emailToUpgrade = process.argv[2];

  if (!emailToUpgrade) {
    console.error("❌ Please provide an email address.");
    console.log("Usage: node makeAdmin.js <user-email@charusat.edu.in>");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const user = await User.findOne({ email: emailToUpgrade.toLowerCase().trim() });

    if (!user) {
      console.error(`❌ User with email ${emailToUpgrade} not found in database.`);
      process.exit(1);
    }

    user.role = "SUPER_ADMIN";
    await user.save();

    console.log(`🎉 Success! ${user.email} is now a SUPER_ADMIN.`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

makeAdmin();
