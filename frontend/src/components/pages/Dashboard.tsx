import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { StatisticsCards } from '../dashboard/StatisticsCards';
import { DisasterCharts } from '../dashboard/DisasterCharts';
import { DisasterMap } from '../map/DisasterMap';
import { AlertList } from '../alerts/AlertList';
import { AlertAISummary } from '../ai/AlertAISummary';
import { AIChat } from '../ai/AIChat';
import { PredictiveInsights } from '../ai/PredictiveInsights';
import { type DisasterAlert } from '../../types/disaster-alert';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw, Filter } from 'lucide-react';

export function Dashboard() {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DisasterAlert | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const typeIcons = {
    earthquake: '🌋',
    flood: '🌊',
    storm: '⛈️',
    wildfire: '🔥',
    volcanic: '🌋',
    tsunami: '🌊'
  }; 

  const severityColors = {
    'critical': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800',
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  React.useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Disaster Dashboard</h1>
            <p className="text-muted-foreground">Real-time monitoring of natural diasters and alerts</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Statistics Card */}
        <StatisticsCards />

        {/* Main Content Tabs */}
        <Tabs
          defaultValue="map"
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="alerts">Alert List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Map View */}
          <TabsContent value="map" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Disaster Map</CardTitle>
                    <CardDescription>
                      Real-time visualization of active disaster alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px]">
                      <DisasterMap 
                        onAlertSelect={setSelectedAlert}
                        selectedAlert={selectedAlert}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Alert</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAlert ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {typeIcons[selectedAlert.type] ?? '⚠️'}
                          </span>
                          <h3 className="font-semibold">{selectedAlert.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedAlert.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-1 rounded-full ${severityColors[selectedAlert.severity] ?? 'bg-green-100 text-green-800'}`}>
                            {selectedAlert.severity}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(selectedAlert.started_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-6">
                          <AlertAISummary alert={selectedAlert} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Select an alert on the map to view details
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Report New Incident
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      View Safety Tips
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download Alert Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Alert List View */}
          <TabsContent value="alerts">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts ({alerts.length})</CardTitle>
                  <CardDescription>All currently active disaster alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertList
                    alerts={alerts}
                    selectedAlert={selectedAlert}
                    onAlertSelect={setSelectedAlert}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAlert ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedAlert.title}</h3>
                        <p className="text-muted-foreground mt-1">{selectedAlert.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Severity:</span>
                          <p className="text-muted-foreground capitalize">{selectedAlert.severity}</p>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <p className="text-muted-foreground">
                            {Number(selectedAlert.latitude).toFixed(4)}, {Number(selectedAlert.longitude).toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Radius:</span>
                          <p className="text-muted-foreground">{selectedAlert.radius_km} km</p>
                        </div>
                        <div>
                          <span className="font-medium">Started: </span>
                          <p className="text-muted-foreground">
                            {new Date(selectedAlert.started_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Source:</span>
                          <p className="text-muted-foreground">{selectedAlert.source.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {selectedAlert.metadata && (
                        <div>
                          <h4 className="font-medium mb-2">Additional Information</h4>
                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                            {JSON.stringify(selectedAlert.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-6">
                        <AlertAISummary alert={selectedAlert} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Select an alert to view detailed information
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics View */}
          <TabsContent value="analytics">
            <DisasterCharts />
          </TabsContent>

          {/* New Tab: AI Assitant */}
          <TabsContent value="assistant" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AIChat />
              </div>

              <div className="space-y-6">
                <PredictiveInsights />

                {selectedAlert && (
                  <AlertAISummary alert={selectedAlert} />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}