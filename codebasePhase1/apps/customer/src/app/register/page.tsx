'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Select } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@merko/ui';
import { UserRole } from '@merko/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegistering } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !firstName || !lastName || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === UserRole.ADMIN && (!businessName || !businessAddress)) {
      setError('Please fill in all business details fields');
      return;
    }

    try {
      await register({
        email,
        firstName,
        lastName,
        phone: phone || undefined,
        password,
        role,
        businessName: role === UserRole.ADMIN ? businessName : undefined,
        businessAddress: role === UserRole.ADMIN ? businessAddress : undefined,
      });

      if (role === UserRole.ADMIN) {
        toast('Registration Submitted! Your request is pending Super Admin approval.', 'success');
      } else {
        toast('Registration Successful! Your account has been created. Please sign in.', 'success');
      }
      router.push('/login');
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errMsg = axiosError.response?.data?.error || 'Registration failed. Try again.';
      setError(errMsg);
      toast(errMsg, 'error');
    }
  };

  if (role === UserRole.SUPER_ADMIN) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-250 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                SUPER ADMIN LOGIN
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Administration Portal Access Control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="rounded-xl bg-indigo-50/50 p-6 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-350 leading-relaxed">
                  Super Admin accounts are managed internally by MERKO. Credentials are provided by the platform owner or developer.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
              <Button onClick={() => setRole(UserRole.CUSTOMER)} variant="outline" className="w-full">
                Back to Registration
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/80 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Sign up to explore customizable printed merchandise
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
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="role">
                  Account Type
                </label>
                <Select
                  value={role}
                  onChange={(val) => setRole(val as UserRole)}
                  options={[
                    { value: UserRole.CUSTOMER, label: 'Customer (Immediate Access)' },
                    { value: UserRole.ADMIN, label: 'Admin / Vendor (Requires Approval)' },
                    { value: UserRole.SUPER_ADMIN, label: 'Super Admin (Administration)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="firstName">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/50 dark:bg-slate-950/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="lastName">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Connor"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white/50 dark:bg-slate-950/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email Address *
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="phone">
                  Phone (Optional)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/50 dark:bg-slate-950/50"
                />
              </div>

              {role === UserRole.ADMIN && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="businessName">
                      Business Name *
                    </label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Acme Merchandise Corp"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-white/50 dark:bg-slate-950/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="businessAddress">
                      Business Address *
                    </label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="123 Industrial Parkway, Suite A"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="bg-white/50 dark:bg-slate-950/50"
                      required
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                  Password *
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Submitting Registration...' : 'Register'}
              </Button>
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

