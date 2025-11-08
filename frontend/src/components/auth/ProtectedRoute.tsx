import React from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if(!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}