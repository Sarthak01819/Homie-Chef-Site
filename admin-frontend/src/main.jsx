import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminRealtimeProvider } from "./context/AdminRealtimeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminRealtimeProvider>
          <App />
          <Toaster position="top-right" />
        </AdminRealtimeProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
