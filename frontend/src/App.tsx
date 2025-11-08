import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./lib/auth-store";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Dashboard pages
function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your disaster monitoring dashboard</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard Cards */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Active Alerts</h3>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Your Location</h3>
            <p className="text-muted-foreground">Not set</p>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="font-semibold mb-2">Community Reports</h3>
            <p className="text-2xl font-bold text-primary"></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

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