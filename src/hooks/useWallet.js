import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

// Network Configuration
const NETWORK_NAMES = {
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x89": "Polygon Mainnet",
  "0x13882": "Polygon Amoy",
  "0xa4b1": "Arbitrum One",
  "0xa": "Optimism",
  "0x38": "BNB Smart Chain",
  "0x5": "Goerli Testnet",
  "0x7a69": "Hardhat Local", // Chain 31337
  "0x539": "Hardhat Local", // Chain 1337
};

// The chain we require for this app.
const REQUIRED_CHAIN_ID = "0xaa36a7";
const REQUIRED_CHAIN_NAME = "Sepolia Testnet";

// localStorage key for remembering connection.
const LS_KEY = "walletConnected";

// Helper: shorten address for display
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * useWallet — Real MetaMask integration hook.
 *
 * This hook ONLY connects when the user explicitly clicks "Connect".
 * It uses `eth_requestAccounts` which triggers the MetaMask popup.
 * Auto-reconnect is disabled to prevent silently picking up
 * Hardhat/localhost accounts.
 */
export default function useWallet() {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Derived state
  const isConnected = !!account;
  const isWrongNetwork = isConnected && chainId !== REQUIRED_CHAIN_ID;

  // ─── Detect MetaMask (not just any provider) ────
  useEffect(() => {
    // window.ethereum can be injected by MetaMask, Hardhat, or other wallets.
    // We specifically check for MetaMask's flag.
    const ethereum = window.ethereum;
    const hasMM = !!(ethereum && ethereum.isMetaMask);
    setIsMetaMaskInstalled(hasMM);
  }, []);

  // ─── Fetch network info ──────────────────────────
  const fetchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const hexChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainId(hexChainId);
      setNetwork(
        NETWORK_NAMES[hexChainId] || `Chain ${parseInt(hexChainId, 16)}`,
      );
    } catch (err) {
      console.error("Failed to fetch network:", err);
    }
  }, []);

  // ─── Connect Wallet (user-initiated only) ────────
  // Uses wallet_requestPermissions to ALWAYS force the MetaMask popup,
  // even if the site was previously approved. This makes the user
  // explicitly choose which account to connect each time.
  const connectWallet = useCallback(async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setError(
        "MetaMask is not installed. Please install the MetaMask browser extension from metamask.io.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // wallet_requestPermissions ALWAYS opens the MetaMask popup,
      // unlike eth_requestAccounts which silently returns if already approved.
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // After the user approves, grab the selected accounts.
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem(LS_KEY, "true");
        await fetchNetwork();
      }
    } catch (err) {
      if (err.code === 4001) {
        setError(
          'You rejected the connection request. Click "Connect" to try again.',
        );
      } else {
        setError(
          "Failed to connect wallet. Make sure MetaMask is unlocked and try again.",
        );
      }
      console.error("Wallet connection error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchNetwork]);

  // ─── Disconnect Wallet ────────────────────────────
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setNetwork(null);
    setChainId(null);
    setError(null);
    localStorage.removeItem(LS_KEY);
  }, []);

  // ─── Sign-Message Authentication ─────────────────
  const authenticateWithSignature = useCallback(async () => {
    if (!window.ethereum || !account) {
      setError("Wallet not connected.");
      return null;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to authenticate with GovChain.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

      // MetaMask shows a signing popup (no gas cost).
      const signature = await signer.signMessage(message);

      return { address: account, signature, message };
    } catch (err) {
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        setError("Signature request was rejected.");
      } else {
        setError("Failed to sign message. Please try again.");
      }
      console.error("Signature error:", err);
      return null;
    }
  }, [account]);

  // ─── Read Contract Example ───────────────────────
  const readContractExample = useCallback(async () => {
    if (!window.ethereum) {
      setError("Wallet not connected.");
      return null;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      // Sepolia USDC token address
      const tokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
      const abi = ["function name() view returns (string)"];
      const { Contract } = await import("ethers");
      const contract = new Contract(tokenAddress, abi, provider);
      const name = await contract.name();
      return name;
    } catch (err) {
      setError("Contract read failed. Make sure you are on Sepolia testnet.");
      console.error("Contract read error:", err);
      return null;
    }
  }, []);

  // ─── Auto-reconnect (safe — only if MetaMask, not Hardhat) ──
  // Uses eth_accounts (no popup) but ONLY if:
  //   1. The user previously connected (localStorage flag set)
  //   2. window.ethereum.isMetaMask is true (not Hardhat provider)
  useEffect(() => {
    const autoReconnect = async () => {
      if (localStorage.getItem(LS_KEY) !== "true") return;
      if (!window.ethereum || !window.ethereum.isMetaMask) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await fetchNetwork();
        } else {
          // MetaMask is locked or revoked. Clean up.
          localStorage.removeItem(LS_KEY);
        }
      } catch (err) {
        console.error("Auto-reconnect failed:", err);
      }
    };

    autoReconnect();
  }, [fetchNetwork]);

  // ─── MetaMask Event Listeners ─────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (_chainId) => {
      setChainId(_chainId);
      setNetwork(NETWORK_NAMES[_chainId] || `Chain ${parseInt(_chainId, 16)}`);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet]);

  const clearError = useCallback(() => setError(null), []);

  return {
    account,
    network,
    chainId,
    loading,
    error,
    isConnected,
    isMetaMaskInstalled,
    isWrongNetwork,
    requiredChainName: REQUIRED_CHAIN_NAME,

    connectWallet,
    disconnectWallet,
    authenticateWithSignature,
    readContractExample,
    clearError,
  };
}
