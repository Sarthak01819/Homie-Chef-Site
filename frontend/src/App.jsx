import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./components/Home";
import DiscoverMeals from "./pages/DiscoverMeals";

import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import Favourites from "./pages/Favourites";
import Subscription from "./pages/Subscription";
import History from "./pages/History";
import ActiveSubscription from "./pages/ActiveSubscription";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Tracker from "./pages/Tracker";

/* =========================
   PAGE ANIMATION CONFIG
========================= */
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const pageTransition = {
  duration: 0.35,
  ease: "easeInOut",
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="App min-h-screen " style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* 🌍 Public Pages */}
          <Route
            path="/"
            element={
              <AnimatedPage>
                <Home />
              </AnimatedPage>
            }
          />

          <Route
            path="/discover-meals"
            element={
              <AnimatedPage>
                <DiscoverMeals />
              </AnimatedPage>
            }
          />

          <Route
            path="/verify-email/:token"
            element={
              <AnimatedPage>
                <VerifyEmail />
              </AnimatedPage>
            }
          />

          {/* 🔓 Public-only */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AnimatedPage>
                  <Login />
                </AnimatedPage>
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <AnimatedPage>
                  <Register />
                </AnimatedPage>
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <AnimatedPage>
                  <ForgotPassword />
                </AnimatedPage>
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <AnimatedPage>
                  <ResetPassword />
                </AnimatedPage>
              </PublicRoute>
            }
          />

          {/* 🔐 Protected Pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Profile />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Cart />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <OrderHistory />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Favourites />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Subscription />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders-history"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <History />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/active-subscription"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <ActiveSubscription />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;
