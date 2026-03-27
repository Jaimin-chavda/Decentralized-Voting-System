import User from "../models/User.js";
import WhitelistEntry from "../models/WhitelistEntry.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @desc    Register user by checking whitelist and granting the correct scope/role
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const allowOpenSignup = process.env.ALLOW_OPEN_SIGNUP === "true";

    // We must have at least email or walletAddress to verify against whitelist
    if (!normalizedEmail && !walletAddress) {
      return res.status(400).json({ message: "Email or Wallet Address is required" });
    }

    if (normalizedEmail && !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Email Domain Validation (University constraint)
    if (normalizedEmail && !normalizedEmail.endsWith("@charusat.edu.in")) {
      return res.status(400).json({ message: "Only university accounts (@charusat.edu.in) are allowed to register." });
    }

    // Password Validation Rules
    if (password) {
      if (password.length < 8 || password.length > 20) {
        return res.status(400).json({ message: "Password must be between 8 and 20 characters long." });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one special character." });
      }
      if (/^\d+$/.test(password)) {
        return res.status(400).json({ message: "Password cannot contain only numbers." });
      }
      // Check if password contains name or email
      const lowerPassword = password.toLowerCase();
      if (name && lowerPassword.includes(name.toLowerCase())) {
        return res.status(400).json({ message: "Password must not contain your name." });
      }
      if (normalizedEmail) {
        // Just checking the part before @ symbol for email
        const emailPrefix = normalizedEmail.split('@')[0].toLowerCase();
        if (lowerPassword.includes(emailPrefix)) {
          return res.status(400).json({ message: "Password must not contain your email." });
        }
      }
    }

    // Check if user already exists
    let existingUser;
    if (normalizedEmail) existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser && walletAddress) existingUser = await User.findOne({ walletAddress });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Check Whitelist specifically for email or walletAddress
    let whitelistDoc;
    if (normalizedEmail) whitelistDoc = await WhitelistEntry.findOne({ email: normalizedEmail });
    if (!whitelistDoc && walletAddress) whitelistDoc = await WhitelistEntry.findOne({ walletAddress });

    if (!whitelistDoc && !allowOpenSignup) {
      return res.status(403).json({
        message: "You are not whitelisted for this institution. Please contact your administrator."
      });
    }

    // Hash password only for email-password users
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Create the scoped user depending on the whitelist entry's scopeType
    const newUser = new User({
      name,
      email: normalizedEmail || `${walletAddress}@web3.placeholder`, // fallback if only wallet provided
      password: hashedPassword,
      walletAddress,
      role: whitelistDoc?.role || "STUDENT",
      isWhitelisted: Boolean(whitelistDoc),
      status: "ACTIVE",

      // Spread specific scope ids based on the whitelist config
      ...(whitelistDoc?.scopeType === "Class" && { classId: whitelistDoc.scopeId }),
      ...(whitelistDoc?.scopeType === "Department" && { departmentId: whitelistDoc.scopeId }),
      ...(whitelistDoc?.scopeType === "Institute" && { instituteId: whitelistDoc.scopeId }),
      ...(whitelistDoc?.scopeType === "University" && { universityId: whitelistDoc.scopeId }),
    });

    const createdUser = await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: createdUser._id, role: createdUser.role },
      process.env.JWT_SECRET || "fallback_secret_for_development_only",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      walletAddress: createdUser.walletAddress || null,
      role: createdUser.role,
      isWhitelisted: createdUser.isWhitelisted,
      token
    });

  } catch (error) {
    console.error(`Error in registerUser: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Password login is not enabled for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_for_development_only",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isWhitelisted: user.isWhitelisted,
      token
    });
  } catch (error) {
    console.error(`Error in loginUser: ${error.message}`);
    res.status(500).json({ message: "Server Error" });
  }
};

