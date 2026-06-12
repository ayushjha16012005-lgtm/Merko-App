'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@merko/ui';

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotPasswordPending } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please fill in your email');
      return;
    }

    try {
      await forgotPassword({ email });
      setSubmitted(true);
      toast('Reset link generated! Check your logs or console.', 'success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

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
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              We&apos;ll send you instructions to reset your account password
            </CardDescription>
          </CardHeader>
          {submitted ? (
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                ✓
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Password reset link has been generated successfully!
              </p>
              <p className="text-sm text-slate-500">
                Since this is a development sandbox, we logged the link directly to the API server terminal.
              </p>
              <Link href="/login" className="inline-block mt-4 text-indigo-600 font-semibold hover:underline">
                Back to Login
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/35 dark:text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/50 dark:bg-slate-950/50"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isForgotPasswordPending}>
                  {isForgotPasswordPending ? 'Sending Link...' : 'Send Reset Link'}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Back to Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
