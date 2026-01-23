import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, MessageCircle, ThumbsUp, User, CheckCircle, Clock, XCircle } from "lucide-react";
import { type UserReport } from "@/types/community";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import { Button } from '../ui/button';

interface ReportListProps {
  reports: UserReport[];
  onReportSelect?: (report: UserReport) => void;
  selectedReport?: UserReport | null;
  showActions?: boolean;
}

export function ReportList({ reports, onReportSelect, selectedReport, showActions = true}: ReportListProps) {
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': 
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      other: '⚠️',
    }
    return icons[type as keyof typeof icons] || '⚠️';
  };

  const getImageUrl = (path: string) => {
    return `http://localhost:8000${path}`;
  };

  const handleUpvote = async (report: UserReport, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await api.post(`/community/reports/${report.id}/upvote`);
      const { upvoted, upvotes_count } = response.data;

      // Update local state (in a real app, you'd use state management)
      report.user_has_upvoted = upvoted;
      report.upvotes_count = upvotes_count;

      toast({
        title: upvoted ? 'Upvoted!' : 'Upvote removed',
        description: upvoted ? 'Thank you for validating this report.' : 'Upvote removed.',
      });
    } catch (error) {
      console.error('Error upvoting report:', error);
      toast({
        title: 'Upvote failed',
        description: 'Unable to upvote report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-Us', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reports.map((report) => (
          <motion.div
            key={report.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport?.id === report.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
              }`}
              onClick={() => onReportSelect?.(report)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getTypeIcon(report.type)}</span>
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {report.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge className={getStatusColor(report.status)}>
                          <span className="flex items-center">
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </span>
                        </Badge>

                        <Badge className={getSeverityColor(report.severity)}>
                          <span className="capitalize">{report.severity}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Location and User Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3"/>
                          <span>
                            {report.location_name || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{report.user?.name || 'Anonymous'}</span>
                        </div>

                        <span>{formatDate(report.created_at)}</span>
                      </div>

                      {/* Action Buttons */}
                      {showActions && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${report.user_has_upvoted ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={(e) => handleUpvote(report, e)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {report.upvotes_count}
                          </Button>

                          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {report.comments_count}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Media Previews */}
                    {report.media_urls && report.media_urls.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {report.media_urls.slice(0, 3).map((url, index) => (
                          <img 
                            key={index} 
                            src={getImageUrl(url)} 
                            alt={`Evidence ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {report.media_urls.length > 3 && (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                            +{report.media_urls.length}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {reports.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No community reports yet</p>
            <p className="text-sm mt-1">Be the first to share information in your area</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
