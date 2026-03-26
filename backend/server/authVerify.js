/**
 * Backend Verification Example (Node.js + Express)
 *
 * This file is a REFERENCE EXAMPLE — it is NOT wired into the Vite
 * frontend build. Run it separately with:
 *
 *   node server/authVerify.js
 *
 * Prerequisites:
 *   npm install express ethers crypto
 */

import express from 'express';
import { verifyMessage } from 'ethers';
import crypto from 'node:crypto';

const app = express();
app.use(express.json());

// In-memory nonce store (use Redis / DB in production)
const nonceStore = new Map(); // walletAddress → nonce

// 1. Generate Nonce
// The frontend calls this endpoint before asking the user to sign.
app.post('/api/auth/nonce', (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  // Generate a cryptographically-random nonce.
  const nonce = crypto.randomBytes(16).toString('hex');

  // Store it, keyed by the wallet address (lowercase for consistency).
  nonceStore.set(address.toLowerCase(), nonce);

  // Return the full message that the frontend should sign.
  const message = `Sign this message to authenticate with GovChain.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

  return res.json({ message, nonce });
});

// 2. Verify Signature
// The frontend sends { address, signature, message } after the user signs.
app.post('/api/auth/verify', (req, res) => {
  const { address, signature, message } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ error: 'address, signature, and message are required.' });
  }

  try {
    // Core verification step
    // ethers.verifyMessage recovers the signer address from the
    // signature + message. If it matches the claimed address, the
    // user truly owns that wallet.
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed.' });
    }

    // Optional: validate nonce
    // Extract the nonce from the signed message and compare it
    // against the one we stored earlier.
    const storedNonce = nonceStore.get(address.toLowerCase());
    if (!storedNonce || !message.includes(storedNonce)) {
      return res.status(401).json({ error: 'Invalid or expired nonce.' });
    }

    // Invalidate the nonce after use (one-time use).
    nonceStore.delete(address.toLowerCase());

    // Issue session / JWT here
    // In a real app you would create a JWT or session token and
    // return it to the frontend.
    return res.json({
      success: true,
      address: recoveredAddress,
      message: 'Authentication successful!',
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
