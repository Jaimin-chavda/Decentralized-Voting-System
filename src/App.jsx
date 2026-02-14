import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import GovernanceHomepage from "./homepage";
import Login from "./Login";
import Signup from "./Signup";
import WalletConnect from "./WalletConnect";
import AdminDashboard from "./admin/AdminDashboard";
import UserProfile from "./UserProfile";
import VotingPage from "./VotingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GovernanceHomepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/wallet-connect" element={<WalletConnect />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/vote" element={<VotingPage />} />
    </Routes>
  );
}

export default App;
