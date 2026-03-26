import mongoose from "mongoose";
// Native fetch available in Node.js 18+

// Import your models
import University from "./models/University.js";
import Institute from "./models/Institute.js";
import Department from "./models/Department.js";
import Class from "./models/Class.js";
import User from "./models/User.js";
import WhitelistEntry from "./models/WhitelistEntry.js";

// MongoDB URI matching your server
const MONGO_URI = "mongodb://127.0.0.1:27017/votechain";

async function runTest() {
  console.log("🚀 Starting Production-Like API Test...\n");

  try {
    // 1. Connect to Database directly for seeding
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB for testing.");

    // Clean up previous test data to prevent duplicate key errors
    await Promise.all([
      University.deleteMany({}),
      Institute.deleteMany({}),
      Department.deleteMany({}),
      Class.deleteMany({}),
      User.deleteMany({}),
      WhitelistEntry.deleteMany({})
    ]);

    // 2. Build the exact Hierarchy (Like an Admin would on production)
    console.log("🏗️  Building Mock University Hierarchy...");
    const myUni = await University.create({ name: "Global Tech University", description: "Top tier tech school" });
    const myInst = await Institute.create({ name: "Institute of Engineering", universityId: myUni._id });
    const myDept = await Department.create({ name: "Computer Science", instituteId: myInst._id });
    const myClass = await Class.create({ name: "CS-A", batchYear: 2026, departmentId: myDept._id });

    console.log(`✅ Hierarchy Built! Path: ${myUni.name} -> ${myInst.name} -> ${myDept.name} -> ${myClass.name}`);

    // 3. Admin pre-approves/whitelists a student's Web3 wallet
    const testWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
    await WhitelistEntry.create({
      walletAddress: testWalletAddress,
      role: "STUDENT",
      scopeType: "Class",
      scopeId: myClass._id, 
    });
    console.log(`✅ Whitelisted wallet: ${testWalletAddress} for Class: ${myClass.name}`);

    // 4. Simulate the Frontend (React App) making an HTTP Request to the Express Server
    console.log("\n🌐 Simulating Frontend HTTP Request to http://localhost:5000/api/auth/register...");
    
    // Note: Ensure your Express server (node server/index.js) is currently running!
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // The frontend sends the wallet address they got from MetaMask
      body: JSON.stringify({
        name: "Alice Blockchain",
        walletAddress: testWalletAddress 
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("\n🎉 SUCCESS! API responded with registered user:");
      console.log(data);
      console.log(`\nNotice how the role was automatically set to "${data.role}" and isWhitelisted is ${data.isWhitelisted} because the API verified them securely against the Whitelist collection.`);
    } else {
      console.log("\n❌ API Error Response:", data.message);
      console.log("Did you make sure your Express server is running on port 5000? (Run: node server/index.js in another terminal)");
    }
    
  } catch (error) {
    console.error("Test Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTest();
