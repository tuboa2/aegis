import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    // Responsive columns
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    // Container
    '@container',
    className
  );

  return <div className={gridClasses}>{children}</div>
};

// Specialized grid components
export function DashboardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      columns={{ sm: 1, md: 2, lg: 2, xl: 3 }}
      gap="lg"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function StatsGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      columns={{ sm: 2, md: 2, lg: 4, xl: 4 }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function CardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid
      columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}