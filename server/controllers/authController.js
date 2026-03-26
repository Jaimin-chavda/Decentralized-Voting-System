import User from "../models/User.js";
import WhitelistEntry from "../models/WhitelistEntry.js";

/**
 * @desc    Register user by checking whitelist and granting the correct scope/role
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;

    // We must have at least email or walletAddress to verify against whitelist
    if (!email && !walletAddress) {
      return res.status(400).json({ message: "Email or Wallet Address is required" });
    }

    // Check if user already exists
    let existingUser;
    if (email) existingUser = await User.findOne({ email });
    if (!existingUser && walletAddress) existingUser = await User.findOne({ walletAddress });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Check Whitelist specifically for email or walletAddress
    let whitelistDoc;
    if (email) whitelistDoc = await WhitelistEntry.findOne({ email });
    if (!whitelistDoc && walletAddress) whitelistDoc = await WhitelistEntry.findOne({ walletAddress });

    if (!whitelistDoc) {
      return res.status(403).json({ 
        message: "You are not whitelisted for this institution. Please contact your administrator." 
      });
    }

    // Create the scoped user depending on the whitelist entry's scopeType
    const newUser = new User({
      name,
      email: email || `${walletAddress}@web3.placeholder`, // fallback if only wallet provided
      walletAddress,
      role: whitelistDoc.role,
      isWhitelisted: true,
      status: "ACTIVE",

      // Spread specific scope ids based on the whitelist config
      ...(whitelistDoc.scopeType === "Class" && { classId: whitelistDoc.scopeId }),
      ...(whitelistDoc.scopeType === "Department" && { departmentId: whitelistDoc.scopeId }),
      ...(whitelistDoc.scopeType === "Institute" && { instituteId: whitelistDoc.scopeId }),
      ...(whitelistDoc.scopeType === "University" && { universityId: whitelistDoc.scopeId }),
    });

    const createdUser = await newUser.save();

    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      walletAddress: createdUser.walletAddress,
      role: createdUser.role,
      isWhitelisted: createdUser.isWhitelisted
    });

  } catch (error) {
    console.error(`Error in registerUser: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};
