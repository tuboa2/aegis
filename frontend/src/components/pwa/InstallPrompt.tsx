import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { usePWA } from "@/hooks/usePWA";

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  const handleInstall = async () => {
    await installApp();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for a week
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if user recently dismissed the prompt
  React.useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (parseInt(dismissedTime) > oneWeekAgo) {
        setDismissed(true);
      }
    }
  }, []);

  if (!isInstallable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w80"
      >
        <Card className="bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg"> 
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Install Aegis</h3>
                <p className="text-xs text-muted-foreground mt-1">Install the app for a better experience and offline access.</p>
              
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}