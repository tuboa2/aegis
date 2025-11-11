import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type DisasterAlert } from '@/types/disaster-alert';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, User, ExternalLink, AlertTriangle } from 'lucide-react';

interface AlertListProps {
  alerts: DisasterAlert[];
  selectedAlert?: DisasterAlert | null;
  onAlertSelect: (alert: DisasterAlert) => void;
}

export function AlertList({ alerts, selectedAlert, onAlertSelect }: AlertListProps) {
  
  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      earthquake: '🌋',
      flood: '🌊',
      storm: '⛈️',
      wildfire: '🔥',
      volcanic: '🌋',
      tsunami: '🌊',
    };

    return icons[type as keyof typeof icons] || '⚠️';
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-l-4 border
              ${selectedAlert?.id === alert.id ? 'ring-2 ring-primary bg-primary/5' : 'bg-card border-border'}
              ${getSeverityStyles(alert.severity)}
            `}
            onClick={() => onAlertSelect(alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{getTypeIcon(alert.type)}</span>
                  <h3 className="font-semibold text-foreground truncate">{alert.title}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {alert.description}
                </p>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {Number(alert.latitude).toFixed(2)}, {Number(alert.longitude).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 2-3" />
                    <span>{formatDistanceToNow(new Date(alert.started_at))} ago</span>
                  </div>

                  {alert.source === 'user_report' && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>User Report</span>
                    </div>
                  )}

                  {alert.source !== 'user_report' && (
                    <div className="flex items-center space-x-1">
                      <ExternalLink className="h-3 w-3" />
                      <span className="capitalize">{alert.source}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }
                  `}
                >
                  {alert.severity}
                </span>

                {alert.radius_km && (
                  <span className="text-xs text-muted-foreground">
                    {alert.radius_km}km radius
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50"/>
            <p>No Active Alerts</p>
            <p className="text-sm mt-1">Alerts will appear here when detected</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}