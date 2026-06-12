'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@merko/ui';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword, isResetPasswordPending } = useAuth();
  const { toast } = useToast();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from URL.');
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

    try {
      await resetPassword({ token, password });
      toast('Password Updated! Your password has been changed successfully. Please log in.', 'success');
      router.push('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to reset password. Token may have expired.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/35 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
            New Password
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
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isResetPasswordPending || !token}>
          {isResetPasswordPending ? 'Resetting...' : 'Reset Password'}
        </Button>
        <div className="text-center text-sm">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Back to Sign In
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/80 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Provide a secure password for your account
            </CardDescription>
          </CardHeader>
          <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading token details...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </motion.div>
    </div>
  );
}
