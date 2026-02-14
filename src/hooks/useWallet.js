import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// Network Configuration
// Maps hex chain IDs to human-readable network names.
const NETWORK_NAMES = {
  '0x1': 'Ethereum Mainnet',
  '0xaa36a7': 'Sepolia Testnet',
  '0x89': 'Polygon Mainnet',
  '0x13882': 'Polygon Amoy',
  '0xa4b1': 'Arbitrum One',
  '0xa': 'Optimism',
  '0x38': 'BNB Smart Chain',
  '0x5': 'Goerli Testnet',
};

// The chain we require for this app (Sepolia testnet).
const REQUIRED_CHAIN_ID = '0xaa36a7';
const REQUIRED_CHAIN_NAME = 'Sepolia Testnet';

// localStorage key used for auto-reconnect on page refresh.
const LS_KEY = 'walletConnected';

// Helper: shorten an Ethereum address for display
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// useWallet Hook
export default function useWallet() {
  const [account, setAccount] = useState(null);       // Full wallet address
  const [network, setNetwork] = useState(null);        // Human-readable network name
  const [chainId, setChainId] = useState(null);        // Hex chain ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Derived state
  const isConnected = !!account;
  const isWrongNetwork = isConnected && chainId !== REQUIRED_CHAIN_ID;

  // Detect MetaMask on mount
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask);
  }, []);

  // Read chain ID and map to name
  const fetchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const hexChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(hexChainId);
      setNetwork(NETWORK_NAMES[hexChainId] || `Chain ${parseInt(hexChainId, 16)}`);
    } catch (err) {
      console.error('Failed to fetch network:', err);
    }
  }, []);

  // Connect Wallet
  // Requests MetaMask to expose the user's account.
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install the MetaMask browser extension.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // eth_requestAccounts will open the MetaMask popup.
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem(LS_KEY, 'true');
        await fetchNetwork();
      }
    } catch (err) {
      // EIP-1193 error 4001 = user rejected the request.
      if (err.code === 4001) {
        setError('Connection request was rejected. Please approve the MetaMask popup.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchNetwork]);

  // Disconnect Wallet
  // Note: MetaMask doesn't have a true "disconnect" RPC; we simply
  // clear our local state so the UI resets.
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setNetwork(null);
    setChainId(null);
    setError(null);
    localStorage.removeItem(LS_KEY);
  }, []);

  // Sign-Message Authentication
  // 1. Frontend generates a nonce (in production the backend would supply it).
  // 2. User signs the message via MetaMask.
  // 3. Returns { address, signature, message } for backend verification.
  const authenticateWithSignature = useCallback(async () => {
    if (!window.ethereum || !account) {
      setError('Wallet not connected.');
      return null;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Generate a nonce — in a real app, fetch this from your backend.
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to authenticate with GovChain.\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

      // MetaMask will show a signing popup (no gas cost).
      const signature = await signer.signMessage(message);

      return { address: account, signature, message };
    } catch (err) {
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Signature request was rejected.');
      } else {
        setError('Failed to sign message. Please try again.');
      }
      console.error('Signature error:', err);
      return null;
    }
  }, [account]);

  // Example: Read-only contract call
  // Calls name() on a Sepolia ERC-20 token to demonstrate reading from
  // a smart contract without spending gas.
  const readContractExample = useCallback(async () => {
    if (!window.ethereum) {
      setError('Wallet not connected.');
      return null;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);

      // Sepolia USDC token address (Circle's test deployment).
      const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
      const abi = ['function name() view returns (string)'];

      const { Contract } = await import('ethers');
      const contract = new Contract(tokenAddress, abi, provider);
      const name = await contract.name();

      return name;
    } catch (err) {
      setError('Contract read failed. Make sure you are on Sepolia.');
      console.error('Contract read error:', err);
      return null;
    }
  }, []);

  // Auto-reconnect on page load
  // Uses eth_accounts (NOT eth_requestAccounts) so no popup appears.
  useEffect(() => {
    const autoReconnect = async () => {
      if (localStorage.getItem(LS_KEY) !== 'true') return;
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await fetchNetwork();
        } else {
          // MetaMask is locked or account no longer connected. Clean up.
          localStorage.removeItem(LS_KEY);
        }
      } catch (err) {
        console.error('Auto-reconnect failed:', err);
      }
    };

    autoReconnect();
  }, [fetchNetwork]);

  // MetaMask Event Listeners
  useEffect(() => {
    if (!window.ethereum) return;

    // When the user switches accounts in MetaMask.
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User locked MetaMask or revoked access.
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };

    // MetaMask docs recommend reloading on chain change to avoid stale state.
    const handleChainChanged = (_chainId) => {
      setChainId(_chainId);
      setNetwork(NETWORK_NAMES[_chainId] || `Chain ${parseInt(_chainId, 16)}`);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cleanup listeners on unmount.
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // Clear error helper
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    account,
    network,
    chainId,
    loading,
    error,
    isConnected,
    isMetaMaskInstalled,
    isWrongNetwork,
    requiredChainName: REQUIRED_CHAIN_NAME,

    // Actions
    connectWallet,
    disconnectWallet,
    authenticateWithSignature,
    readContractExample,
    clearError,
  };
}
