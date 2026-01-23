import React from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "../ui/button";
import {
  Shield,
  AlertTriangle,
  Map,
  Users,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      window.location.href = '/';
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Shield },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Community', href: '/community', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-border">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aegis</h1>
              <p className="text-xs text-muted-foreground">Disaster Monitoring</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}