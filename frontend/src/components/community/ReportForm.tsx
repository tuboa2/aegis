import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Upload, MapPin, AlertTriangle, X, Camera, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/api";

const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['earthquake', 'flood', 'storm', 'wildfire', 'volcanic', 'tsunami', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-100).max(180),
  location_name: z.string().optional(),
  contact_info: z.string().optional(),
  is_public: z.boolean(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

export function ReportForm({ onSuccess, onCancel, initialLocation }: ReportFormProps) {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(!!initialLocation);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: 'other',
      severity: 'medium',
      is_public: true,
      latitude: initialLocation?.latitude || 14.5995,
      longitude: initialLocation?.longitude || 120.9842,
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browswer does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
        setUseCurrentLocation(true);

        // Reverse geocode to get location name (simplified)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          .then(response => response.json())
          .then(data => {
            setValue('location_name', data.display_name || 'Current Location');
          })
          .catch(() => {
            setValue('location_name', 'Current Location');
          });
      },
      (error) => {
        toast({
          title: 'Location access failed',
          description: error.message || 'Unable to retrieve your current location.',
          variant: 'destructive',
        });
      }
    );
  };

  const handleMediaUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - mediaFiles.length); // Max 5 files

    if (newFiles.length + mediaFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can upload up to 5 files maximum.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast ({
          title: 'Invalid file type',
          description: 'Only image files are supported.',
          variant: 'destructive',
        });
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Each file must be less than 5MB.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append form data with proper boolean handling
      // ✅ Handle each field explicitly - NO dynamic .toString()
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('severity', data.severity);
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      
      if (data.location_name) {
        formData.append('location_name', data.location_name);
      }
      
      if (data.contact_info) {
        formData.append('contact_info', data.contact_info);
      }

      // ✅ THE FIX: Convert boolean to "1" or "0"
      formData.append('is_public', data.is_public ? '1' : '0');

      // Append media files
      mediaFiles.forEach(file => {
        formData.append('media[]', file);
      });

      await api.post('/community/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Report submitted!',
        description: 'Your report has been submitted for review.',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      console.log('VALIDATION ERRORS:', error.response.data.errors);
      toast({
        title: 'Submission failed',
        description: error.response?.data?.message || 'Unable to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disasterTypes = [
    { value: 'earthquake', label: 'Earthquake', icon: '🌋' },
    { value: 'flood', label: 'Flood', icon: '🌊' },
    { value: 'storm', label: 'Storm', icon: '⛈️' },
    { value: 'wildfire', label: 'Wildfire', icon: '🔥' },
    { value: 'volcanic', label: 'Volcanic Activity', icon: '🌋' },
    { value: 'tsunami', label: 'Tsunami', icon: '🌊' },
    { value: 'other', label: 'Other', icon: '⚠️' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Submit Community Report
          </CardTitle>
          <CardDescription>
            Share information about disaster or emergencies in your area to help others stay safe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the situation"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about what you're observing..."
                  rows={4}
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Disaster Type *</Label>
                  <Select onValueChange={(value) => setValue('type', value as any)} defaultValue="other">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level *</Label>
                  <Select onValueChange={(value) => setValue('severity', value as any)} defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold">Location</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>

                <div className="flex-1 text-sm text-muted-foreground flex items-center">
                  {useCurrentLocation ? (
                    <span className="text-green-600">✓ Using your current location</span>
                  ) : (
                    'Click to use your current location'
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                    className={errors.latitude ? 'border-destructive' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitde">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                    className={errors.longitude ? 'border-destructive' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_name">Location Name (Optional)</Label>
                  <Input
                    id="location_name"
                    placeholder="e.g., Street name, landmark, or area"
                    {...register('location_name')}
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold">Media Evidence</h3>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="media"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                    className="hidden"
                  />

                  <label htmlFor="media" className="cursor-pointer">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Photos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload up to 5 images (5MB each)
                    </p>
                  </label>
                </div>

                {/* Media Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="contact_info">How can responders contact you?</Label>
                  <Input
                    id="contact_info"
                    placeholder="Phone number, email, or other contact method"
                    {...register('contact_info')}
                  />
                  <p className="text-xs text-muted-foreground">
                    This information will only be shared with verified emergency responders
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    {...register('is_public')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public" className="text-sm">Make this report public to help others in the community</Label>
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this report, you agree to our terms of service.
                Emergency reports are reviewd by our team for verification.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}