import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Map, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/auth-store";

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground"/>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Aegis</h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Disaster Monitoring
              </p>
            </motion.div>

            <nav className="flex space-x-6">
              {isAuthenticated ? (
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                  <Button asChild>
                    <a href="/register">Get Started</a>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            Protecting Communities with{' '}
            <span className="text-primary">AI-Driven</span> Disaster Monitoring
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Real-time alerts, predictive analytics, and community reporting
            to keep people safe during natural disasters.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <a href="/register">Get Started</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {[
            { icon: AlertTriangle, title: 'Real-time Alerts', desc: 'Instant notifications for earthquakes, storms, and floods' },
            { icon: Map, title: 'Live Disaster Map', desc: 'Interactive map showing active disasters and risks' },
            { icon: Users, title: 'Community Reports', desc: 'Crowdsourced information from affected areas' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}