import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Statistics {
  total_active: number;
  last_24_hours: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export function StatisticsCards() {
  const [stats, setStats] = React.useState<Statistics | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/alerts/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-xl border-border animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Active Alerts',
      value: stats?.total_active || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      title: 'Last 24 Hours',
      value: stats?.last_24_hours || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      title: 'Disaster Types',
      value: Object.keys(stats?.by_type || {}).length,
      icon: MapPin,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
    {
      title: 'High Severity',
      value: (stats?.by_severity?.high ?? 0) + (stats?.by_severity?.critical ?? 0),
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}