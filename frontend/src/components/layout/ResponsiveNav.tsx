import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, Shield, AlertTriangle, Map, Users, Settings, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "@/lib/utils";

interface ResponsiveNavProps {
  children: React.ReactNode;
}

export function ResponsiveNav({ children }: ResponsiveNavProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Shield },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Community', href:'/community', icon: Users },
    { name: 'SafetyHub', href: '/safety', icon: Settings },
  ];

  const mobileMenuVariants: Variants = {
    closed: {
      x: -300,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */ }
      <header className="lg:hidden border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Aegis</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 w-80 bg-background border-r border-border z-50 lg:hidden overflow-y-auto"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Aegis</h1>
                    <p className="text-xs text-muted-foreground">Disaster Monitoring</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="h-5 w-5"/>
                </button>
              </div>
              
              {/* User Info */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {navigation.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.a>
                ))}
              </nav>

              {/* Theme Toggle for Mobile */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed inst-y-0 left-0 w-64 border-r border-border bg-background/95 backdrop-blur-sm z-30">
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

          {/* User Action */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "lg:pl-64" // Desktop sidebar offset
      )}>
        <main className={cn(
          "p-4 lg:p-8",
          "min-h-screen"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}