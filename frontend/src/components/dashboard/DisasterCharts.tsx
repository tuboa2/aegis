import React from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from "@/lib/api";

interface ChartData {
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a43a'
};

const TYPE_COLORS = {
  earthquake: '#ef4444',
  flood: '#3b82f6',
  storm: '#8b5cf6',
  wildfire: '#f59e0b',
  volcanic: '#6366f1',
  tsuname: '#06b6d4'
};

export function DisasterCharts() {
  const [data, setData] = React.useState<ChartData | null>(null);

  const fetchChartData = async () => {
    try {
      const response = await api.get('/alerts/statistics');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  React.useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 60000);
    return () => clearInterval(interval);
  }, []);

  const severityData = data?.by_severity ? Object.entries(data.by_severity).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: SEVERITY_COLORS[name as keyof typeof SEVERITY_COLORS]
  })) : [];

  const typeData = data?.by_type ? Object.entries(data.by_type).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: TYPE_COLORS[name as keyof typeof TYPE_COLORS]
  })) : [];

  console.log("Processed Type Data:", typeData);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Severity</CardTitle>
          <CardDescription>Distribution by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(Number(percent) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disaster Types */}
      <Card>
        <CardHeader>
          <CardTitle>Disaster Types</CardTitle>
          <CardDescription>Distribution by disaster type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray= "3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> 
    </div>
  );
}