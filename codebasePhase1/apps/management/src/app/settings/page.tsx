'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@merko/ui';
import { 
  Settings, ShieldAlert, CreditCard, Paintbrush, Truck, Save
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('Merko Customized');
  const [supportEmail, setSupportEmail] = useState('support@merko.com');
  
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_MerkoLiveKey10293');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••••••••••');
  const [sandboxMode, setSandboxMode] = useState(true);

  const [maxUploadSize, setMaxUploadSize] = useState('10');
  const [allowedExtensions, setAllowedExtensions] = useState('.png, .jpg, .jpeg, .svg, .pdf');

  const [returnWindow, setReturnWindow] = useState('14');
  const [originPincode, setOriginPincode] = useState('560001');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('Store settings updated successfully!', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Store Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure gateway credentials, canvas upload thresholds, returns policy timers, and general store profile.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-indigo-500" /> General Store Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Storefront Brand Name *</label>
              <Input 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Support Contact Email *</label>
              <Input 
                type="email"
                value={supportEmail} 
                onChange={(e) => setSupportEmail(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Razorpay integration */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-emerald-500" /> Razorpay Payment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">API Key ID *</label>
                <Input 
                  value={razorpayKey} 
                  onChange={(e) => setRazorpayKey(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Secret *</label>
                <Input 
                  type="password"
                  value={razorpaySecret} 
                  onChange={(e) => setRazorpaySecret(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/60 w-fit">
              <input 
                id="sandboxToggle"
                type="checkbox"
                checked={sandboxMode}
                onChange={(e) => setSandboxMode(e.target.checked)}
                className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
              />
              <label htmlFor="sandboxToggle" className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                Enable Sandbox / Test Mode API
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Customizer config */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Paintbrush className="h-4.5 w-4.5 text-violet-500" /> Visual Canvas Customizer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Artwork Upload Size (MB)</label>
              <Input 
                type="number"
                value={maxUploadSize} 
                onChange={(e) => setMaxUploadSize(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Allowed File Extensions</label>
              <Input 
                value={allowedExtensions} 
                onChange={(e) => setAllowedExtensions(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Logistics and returns */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-amber-500" /> Logistics & Reverse Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Return Authorization Window (Days)</label>
              <Input 
                type="number"
                value={returnWindow} 
                onChange={(e) => setReturnWindow(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Origin Warehouse pincode</label>
              <Input 
                value={originPincode} 
                onChange={(e) => setOriginPincode(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-10 flex items-center gap-2 text-xs"
          >
            <Save className="h-4.5 w-4.5" />
            {isSaving ? 'Saving Changes...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
