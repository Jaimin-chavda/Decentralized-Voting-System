import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./utils/toast";
import { AuthProvider } from "./context/AuthContext";
import { ProposalProvider } from "./context/ProposalContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ProposalProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ProposalProvider>
    </AuthProvider>
  </BrowserRouter>,
);
