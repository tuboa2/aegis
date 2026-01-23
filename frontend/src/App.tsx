import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./lib/auth-store";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Dashboard } from "./components/pages/Dashboard";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />}
          />
          <Route 
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />}
          />
          <Route 
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterForm />}
          />

          <Route 
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;