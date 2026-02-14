import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import GovernanceHomepage from './homepage';
import Login from './login';
import Signup from './Signup';
import WalletConnect from './Walletconnect';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GovernanceHomepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wallet-connect" element={<WalletConnect />} />
      </Routes>
    </Router>
  );
}

export default App;
