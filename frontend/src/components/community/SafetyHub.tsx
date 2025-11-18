import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, Globe, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { type SafetyTip, type EmergencyResource } from '@/types/community';
import { api } from '@/lib/api';
import { useToast } from '../ui/use-toast';

export function SafetyHub() {
  const [safetyTips, setSafetyTips] = React.useState<SafetyTip[]>([]);
  const [emergencyResources, setEmergencyResources] = React.useState<EmergencyResource | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        const [tipsResponse, resourcesResponse] = await Promise.all([
          api.get('/community/safety-tips'),
          api.get('/community/emergency-resources'),
        ]);
  
        setSafetyTips(tipsResponse.data);
        setEmergencyResources(resourcesResponse.data);
      } catch (error) {
        console.error('Error fetching safety data:', error);
        toast({
          title: 'Unable to load safety information',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyData();
  }, [toast]);

  const getTypeIcon = (type: string) => {
    const icons = {
      earthquake: '🌋',
      flood: '🌊',
      storm: '⛈️',
      wildfire: '🔥',
      volcanic: '🌋',
      tsunami: '🌊',
      general: '📚',
    };
    return icons[type as keyof typeof icons] || '📚';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading safety information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20}}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-foreground">
          Safety Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Essential resources and information to stay safe during disasters
        </p>
      </motion.div>

      <Tabs defaultValue="tips" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tips">Safety Tips</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="guides">Preparedness Guides</TabsTrigger>
        </TabsList>

        {/* Safety Tips */}
        <TabsContent value="tips" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg: grid-cols-2">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20}}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1}}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <span className="text-2xl mr-2">{getTypeIcon(tip.disaster_type)}</span>
                      </CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {tip.severity_level}
                      </Badge>
                    </div>
                    <CardDescription>{tip.short_description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tip.content}
                    </p>
                    {tip.tags && tip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tip.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="inline-bloc bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {tip.source && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Source: {tip.source}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Emergency Contacts */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2"/>
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  Important phone numbers for emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyResources?.emergency_contacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1}}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.description}</p>
                    </div>
                    <a 
                      href={`tel:${contact.number}`}
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Call {contact.number}
                    </a>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Important Websites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Important Websites
                </CardTitle>
                <CardDescription>
                  Official sources for disaster information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyResources?.important_websites.map((website, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <a 
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <p className="font-medium hover:text-primary transition-colors">
                        {website.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {website.description}
                      </p>
                    </a>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preparedness Guides */}
        <TabsContent
          value="guides"
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            {emergencyResources?.preparedness_guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guide.steps.map((step, stepIndex) => (
                      <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                        className="flex items-start space-x-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Create Emergency Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Prepare your family emergency plan
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold">Build Emergency Kit</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Essential supplies checklist
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Phone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Emergency Contacts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Save important numbers
            </p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Stay Informed</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor official sources
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}