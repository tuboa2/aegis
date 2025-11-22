import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circle' | 'image';
  animation?: 'pulse' | 'shimmer' | 'wave';
  children?: React.ReactNode;
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  children
}: SkeletonProps) {
  const baseClasses = cn(
    'animate-pulse-soft bg-muted rounded-md',
    {
      'rounded-lg': variant === 'card',
      'rounded-full': variant === 'circle',
      'rounded-none' : variant === 'text',
      'aspect-video': variant === 'image',
    },
    className
  );

  const shimmerClasses = cn(
    'bg-shimmer animate-shimmer bg-200%',
    className
  );

  if (animation === 'shimmer') {
    return <div className={shimmerClasses}>{children}</div>
  }

  return <div className={baseClasses}>{children}</div>
}

// Pre-composed skeleton components
export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <Skeleton variant="card" className="h-48" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
    </motion.div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="card" className="h-24" />
      <Skeleton variant="card" className="h-24" />
      <Skeleton variant="card" className="h-24" />
      <Skeleton variant="card" className="h-24" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[600px] bg-muted rounded-xl overflow-hidden"
    >
      <Skeleton variant="image" className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          Loading map data...
        </p>
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        <Skeleton variant="text" className="h-6 flex-1" />
        <Skeleton variant="text" className="h-6 flex-1" />
        <Skeleton variant="text" className="h-6 flex-1" />
        <Skeleton variant="text" className="h-6 flex-1" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton variant="text" className="h-12 flex-1" />
          <Skeleton variant="text" className="h-12 flex-1" />
          <Skeleton variant="text" className="h-12 flex-1" />
          <Skeleton variant="text" className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}
