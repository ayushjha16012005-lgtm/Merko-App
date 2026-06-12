'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, useToast } from '@merko/ui';
import axios from 'axios';

function ActivationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Activation token is missing. Please check your invitation email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Activation token is missing');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      // Direct call to API backend
      await axios.post('http://localhost:4000/api/v1/users/activate-super-admin', {
        token,
        password,
      });

      toast('Super Admin Account Activated Successfully!', 'success');
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errMsg = axiosError.response?.data?.error || 'Failed to activate account. The invitation may have expired.';
      setError(errMsg);
      toast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-slate-200 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 text-center">
        <CardHeader className="space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/35 text-green-600 dark:text-green-400 text-xl font-bold">
            ✓
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            Activation Complete
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Your Super Admin account has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your login credentials are now active. You can log in directly to the MERKO Management Portal.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.href = 'http://localhost:3001/'} className="w-full">
            Go to Management Portal
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
          Activate Super Admin
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Setup your secure password to complete your registration
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/35 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
              Secure Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 pr-10 dark:bg-slate-950/50"
                required
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <span className="text-xs font-semibold">Hide</span>
                ) : (
                  <span className="text-xs font-semibold">Show</span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/50 dark:bg-slate-950/50"
              required
              disabled={!token}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
            {isSubmitting ? 'Activating Account...' : 'Activate & Setup'}
          </Button>
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Need help? Contact the MERKO system administrator.
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ActivateSuperAdminPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <Card className="border-slate-200 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 p-8 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading activation details...</p>
          </Card>
        }>
          <ActivationForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
