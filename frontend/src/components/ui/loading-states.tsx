import React from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  state: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  className?: string;
}

export function LoadingState({ state, message, className }: LoadingStateProps) {
  const states = {
    loading: {
      icon: Loader2,
      color: 'text-primary',
      message: message || 'Loading...',
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      message: message || 'Success!',
    },
    error: {
      icon: AlertCircle,
      color: 'text-destructive',
      message: message || 'An error occurred',
    },
    idle: {
      icon: null,
      color: '',
      message: '',
    },
  };

  const currentState = states[state];

  if (state === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'flex items-center justify-center space-x-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      {currentState.icon && (
        <motion.div
          animate={state === 'loading' ? { rotate: 360 } : {}}
          transition={state === 'loading' ? { duration: 1, repeat: Infinity, ease: 'linear'} : {}}
        >
          <currentState.icon className={cn('h-5 w-5', currentState.color)} />
        </motion.div>
      )}
      <span className="text-sm font-medium">{currentState.message}</span>
    </motion.div>
  );
}

// Progressive loading component
interface ProgressiveLoadProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton?: React.ReactNode;
  delay?: number;
}

export function ProgressiveLoad({ children, isLoading, skeleton, delay = 200 }: ProgressiveLoadProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading, delay]);

  if (showSkeleton && isLoading) {
    return skeleton || <div className="animate-pulse bg-muted rounded-lg h-full w-full" />;
  }

  return <>{children}</>;
}

// Loading overlay for full-page loads
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-lg font-semibold text-foreground">{message}</p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-primary rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}