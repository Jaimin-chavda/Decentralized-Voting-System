import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { HARDHAT_CHAIN_ID, HARDHAT_NETWORK } from "../contracts/contractConfig";

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
const REQUIRED_CHAIN_ID = HARDHAT_CHAIN_ID;
const REQUIRED_CHAIN_NAME = HARDHAT_NETWORK.chainName;

// sessionStorage key for remembering connection.
const SS_KEY = "walletConnected";
const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalhostHost(hostname) {
  return LOCALHOST_HOSTS.has((hostname || "").toLowerCase());
}

/**
 * Generates a MetaMask deep link for the given URL.
 * MetaMask documentation suggests prefixing with 'https://metamask.app.link/dapp/'
 */
function buildMetaMaskDeepLink(url) {
  if (!url) return "https://metamask.app.link/";
  // For most dapps, we want to remove the protocol but MetaMask sometimes 
  // handles it better if we keep it or specifically use 'https://'
  const cleanUrl = url.replace(/^https?:\/\//i, "");
  return `https://metamask.app.link/dapp/${cleanUrl}`;
}

/**
 * Explicitly redirect the user to the MetaMask app.
 */
export function redirectToMetaMask(currentUrl) {
  const deepLink = buildMetaMaskDeepLink(currentUrl || window.location.href);
  window.location.href = deepLink;
}

function getPreferredInjectedProvider() {
  const ethereum = window.ethereum;
  if (!ethereum) return null;

  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    const metaMaskProvider = ethereum.providers.find((p) => p?.isMetaMask);
    return metaMaskProvider || ethereum.providers[0];
  }

  return ethereum;
}

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
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [mobileDeepLinkBlocked, setMobileDeepLinkBlocked] = useState(false);

  // Derived state
  const isConnected = !!account;
  const isWrongNetwork = isConnected && chainId !== REQUIRED_CHAIN_ID;
  const canDeepLinkMetaMask =
    isMobileDevice && !isMetaMaskInstalled && !mobileDeepLinkBlocked;

  // ─── Detect MetaMask (not just any provider) ────
  useEffect(() => {
    const ua = navigator?.userAgent || "";
    const mobile = MOBILE_UA_REGEX.test(ua);
    setIsMobileDevice(mobile);
    setMobileDeepLinkBlocked(mobile && isLocalhostHost(window.location.hostname));

    // window.ethereum can be injected by MetaMask, Hardhat, or other wallets.
    // We specifically check for MetaMask's flag.
    const provider = getPreferredInjectedProvider();
    const hasMM = !!provider;
    setIsMetaMaskInstalled(hasMM);
  }, []);

  // ─── Fetch network info ──────────────────────────
  const fetchNetwork = useCallback(async () => {
    const provider = getPreferredInjectedProvider();
    if (!provider) return;
    try {
      const hexChainId = await provider.request({
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
    const provider = getPreferredInjectedProvider();
    const hasMMProvider = !!provider;

    if (!hasMMProvider) {
      if (isMobileDevice) {
        if (isLocalhostHost(window.location.hostname)) {
          setError(
            "This URL uses localhost, which MetaMask mobile cannot open directly. Run the app with a LAN/IP URL and open that URL on your phone.",
          );
          return;
        }

        redirectToMetaMask(window.location.href);
        return;
      }

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
      await provider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // After the user approves, grab the selected accounts.
      const accounts = await provider.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        sessionStorage.setItem(SS_KEY, "true");
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
  }, [fetchNetwork, isMobileDevice]);

  // ─── Disconnect Wallet ────────────────────────────
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setNetwork(null);
    setChainId(null);
    setError(null);
    sessionStorage.removeItem(SS_KEY);
  }, []);

  // ─── Sign-Message Authentication ─────────────────
  const authenticateWithSignature = useCallback(async () => {
    const provider = getPreferredInjectedProvider();
    if (!provider || !account) {
      setError("Wallet not connected.");
      return null;
    }

    try {
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to authenticate with VoteChain.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

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

  // ─── Switch Network ──────────────────────────────
  const switchNetwork = useCallback(async () => {
    const provider = getPreferredInjectedProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        // Network not added to MetaMask, add it automatically
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: REQUIRED_CHAIN_ID,
                chainName: REQUIRED_CHAIN_NAME,
                rpcUrls: HARDHAT_NETWORK.rpcUrls,
                nativeCurrency: HARDHAT_NETWORK.nativeCurrency,
                blockExplorerUrls: HARDHAT_NETWORK.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
          setError("Failed to add Sepolia network. Please add it manually.");
        }
      } else {
        console.error("Failed to switch network:", err);
      }
    }
  }, []);

  // ─── Read Contract Example ───────────────────────
  const readContractExample = useCallback(async () => {
    const provider = getPreferredInjectedProvider();
    if (!provider) {
      setError("Wallet not connected.");
      return null;
    }

    try {
      const ethersProvider = new BrowserProvider(provider);
      // Sepolia USDC token address
      const tokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
      const abi = ["function name() view returns (string)"];
      const { Contract } = await import("ethers");
      const contract = new Contract(tokenAddress, abi, ethersProvider);
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
      if (sessionStorage.getItem(SS_KEY) !== "true") return;
      const provider = getPreferredInjectedProvider();
      if (!provider) return;

      try {
        const accounts = await provider.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await fetchNetwork();
        } else {
          // MetaMask is locked or revoked. Clean up.
          sessionStorage.removeItem(SS_KEY);
        }
      } catch (err) {
        console.error("Auto-reconnect failed:", err);
      }
    };

    autoReconnect();
  }, [fetchNetwork]);

  // ─── MetaMask Event Listeners ─────────────────────
  useEffect(() => {
    const provider = getPreferredInjectedProvider();
    if (!provider || !provider.on || !provider.removeListener) return;

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

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
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
    isMobileDevice,
    isMetaMaskInstalled,
    canDeepLinkMetaMask,
    mobileDeepLinkBlocked,
    isWrongNetwork,
    requiredChainName: REQUIRED_CHAIN_NAME,

    connectWallet,
    disconnectWallet,
    authenticateWithSignature,
    readContractExample,
    switchNetwork,
    clearError,
    redirectToMetaMask: () => redirectToMetaMask(window.location.href),
  };
}
