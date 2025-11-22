import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentTheme = themeOptions.find(t => t.value === theme) || themeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg transition-all hover:scale-105 hover:bg-accent/50"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={actualTheme}
              initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <currentTheme.icon className="h-4 w-4" />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border-bg-background/95 backdrop-blur-sm"
      >
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center space-x-2 rounded-lg p-2 transition-all ${
              theme === option.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
            }`}
          >
            <option.icon className="h-4 w-4" />
            <span>{option.label}</span>
            {theme === option.value && (
              <motion.div
                layoutId="activeTheme"
                className="h-1.5 w-1.5 rounded-full bg-primary ml-auto"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}