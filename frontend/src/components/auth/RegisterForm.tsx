import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  location: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/register', data);
      const { user, access_token } = response.data;

      login(user, access_token);

      toast({
        title: 'Welcome to Aegis!',
        description: 'Account created successfully.',
      });

      // Redirect to dashboard
      window.location.href = '/dashboaard';
    } catch (error) {
      let errorMessage = 'Something went wrong.';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Something went wrong';
      }

      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join Aegis to start monitoring disasters in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location"
                type="text"
                placeholder="City, Country"
                {...register('location')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                {...register('password')}
                className={errors.password ? 'border-destructive': ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Confirm Password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Confirm your password"
                {...register('password_confirmation')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{''}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}