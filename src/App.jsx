import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import GovernanceHomepage from "./homepage";
import Login from "./Login";
import Signup from "./Signup";
import WalletConnect from "./WalletConnect";
import AdminDashboard from "./admin/AdminDashboard";
import UserProfile from "./UserProfile";
import VotingPage from "./VotingPage";
import Docs from "./Docs";

// Pages that should NOT show the shared navbar/footer
const noLayoutPages = [
  "/admin",
  "/vote",
  "/login",
  "/signup",
  "/wallet-connect",
  "/profile",
];

function App() {
  const location = useLocation();
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    <>
      {showLayout && <Navbar />}
      <main className={showLayout ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<GovernanceHomepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/wallet-connect" element={<WalletConnect />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
      {showLayout && <Footer />}
    </>
  );
}

export default App;
