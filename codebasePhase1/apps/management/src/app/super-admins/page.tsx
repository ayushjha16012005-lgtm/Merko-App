'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, useToast } from '@merko/ui';
import { useSuperAdmins, useInviteSuperAdmin, useUpdateSuperAdminStatus, useAuditLogs } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/auth-store';
import { ShieldCheck, Mail, Phone, Calendar, UserPlus, Ban, Trash2, CheckCircle, X, ShieldAlert, Activity } from 'lucide-react';

export default function SuperAdminsPage() {
  const { data: admins = [], isLoading, error } = useSuperAdmins();
  const { data: auditLogs = [], isLoading: logsLoading } = useAuditLogs();
  const inviteMutation = useInviteSuperAdmin();
  const updateStatusMutation = useUpdateSuperAdminStatus();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email) {
      setFormError('Please fill in Name and Email');
      return;
    }

    try {
      await inviteMutation.mutateAsync({ fullName, email, phone: phone || undefined });
      toast(`Invitation sent to ${email} successfully!`, 'success');
      setShowInviteModal(false);
      setFullName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setFormError(axiosError.response?.data?.error || 'Failed to send invitation');
      toast(axiosError.response?.data?.error || 'Failed to send invitation', 'error');
    }
  };

  const handleStatusAction = async (id: string, action: 'suspend' | 'reactivate' | 'remove', name: string) => {
    if (confirm(`Are you sure you want to perform this action ("${action}") on "${name}"?`)) {
      try {
        await updateStatusMutation.mutateAsync({ id, action });
        toast(`Action "${action}" completed successfully.`, 'success');
      } catch (err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        toast(axiosError.response?.data?.error || `Failed to update status for ${name}`, 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ACTIVATION':
        return <Badge variant="warning" className="animate-pulse bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-extrabold uppercase py-0.5 px-2">Invited</Badge>;
      case 'ACTIVE':
        return <Badge variant="success" className="text-[9px] font-extrabold uppercase py-0.5 px-2">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="secondary" className="bg-red-50 text-red-750 border border-red-200 dark:bg-red-950/40 dark:text-red-400 text-[9px] font-extrabold uppercase py-0.5 px-2">Suspended</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] font-extrabold uppercase py-0.5 px-2">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl py-4 text-slate-900 dark:text-slate-100">
      {/* Header Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Super Admins</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision system authority credentials, monitor invited access states, and review platform audits.
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-650 hover:bg-indigo-700 text-white flex items-center gap-2 font-bold shrink-0 self-start sm:self-center text-xs h-9"
        >
          <UserPlus className="h-4.5 w-4.5" /> Invite Super Admin
        </Button>
      </div>

      {/* Main Registry List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-55 p-4 text-center text-xs font-bold text-red-650 dark:bg-red-950/20 dark:text-red-400">
          Failed to fetch admin accounts. Verify security permissions.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {admins.map((adm) => {
              const isSelf = adm.id === currentUser?.id;
              
              return (
                <motion.div
                  key={adm.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`overflow-hidden border bg-white dark:bg-slate-900/60 shadow-sm transition-all flex flex-col justify-between min-h-[180px] ${
                    isSelf 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                      : 'border-slate-205 dark:border-slate-800'
                  }`}>
                    <div>
                      <div className={`h-1.5 ${isSelf ? 'bg-indigo-605' : 'bg-slate-800 dark:bg-slate-700'}`} />
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {adm.firstName} {adm.lastName}
                            {isSelf && (
                              <Badge className="bg-indigo-50 text-indigo-755 dark:bg-indigo-950/30 dark:text-indigo-400 text-[9px] font-extrabold uppercase">
                                Self
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-slate-450" /> Joined: {new Date(adm.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {getStatusBadge(adm.status)}
                      </CardHeader>
                      <CardContent className="space-y-4 pt-1 text-xs">
                        <div className="space-y-2 text-slate-550 dark:text-slate-400 font-semibold">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate" title={adm.email}>{adm.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{adm.phone || 'No phone record'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Action Menu (Not available on self) */}
                    {!isSelf && (
                      <div className="flex gap-2 justify-end p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
                        {adm.status === 'ACTIVE' && (
                          <Button
                            onClick={() => handleStatusAction(adm.id, 'suspend', `${adm.firstName} ${adm.lastName}`)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-amber-600 hover:bg-amber-700 text-white h-7 px-2.5 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Ban className="h-3 w-3" /> Suspend
                          </Button>
                        )}
                        {adm.status === 'SUSPENDED' && (
                          <Button
                            onClick={() => handleStatusAction(adm.id, 'reactivate', `${adm.firstName} ${adm.lastName}`)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[10px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Activate
                          </Button>
                        )}
                        <Button
                          onClick={() => handleStatusAction(adm.id, 'remove', `${adm.firstName} ${adm.lastName}`)}
                          disabled={updateStatusMutation.isPending}
                          variant="destructive"
                          className="h-7 px-2.5 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Unified Platform Audits history logs */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <ShieldAlert className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold">Audit History Trail</h2>
        </div>
        <Card className="border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900 shadow-sm max-h-[360px] overflow-y-auto">
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="p-8 text-center text-xs animate-pulse">Fetching platform logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No logs processed in registry.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850 font-mono text-[11px] text-slate-550 dark:text-slate-400">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition flex justify-between gap-4">
                    <div className="flex gap-2 items-start">
                      <span className="text-slate-400 shrink-0">[{new Date(log.createdAt).toLocaleString('en-IN')}]</span>
                      <div>
                        <strong className="text-indigo-650 dark:text-indigo-400">{log.action}</strong>
                        <span className="text-slate-400 block mt-0.5">{log.resource ? `${log.resource}${log.resourceId ? ` / ${log.resourceId}` : ''}` : 'System invocation event.'}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-slate-405 font-bold uppercase text-[9px] tracking-wider bg-slate-100 dark:bg-slate-800 rounded px-1.5 h-4.5 flex items-center">{log.user?.role || 'SYSTEM'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Invite Super Admin</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-650">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/35 dark:text-red-400">
                    {formError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="inviteName">Full Name *</label>
                  <Input
                    id="inviteName"
                    type="text"
                    placeholder="Marcus Aurelius"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="inviteEmail">Email Address *</label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="marcus@merko.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase" htmlFor="invitePhone">Phone Number (Optional)</label>
                  <Input
                    id="invitePhone"
                    type="tel"
                    placeholder="9999888877"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/20 px-6 py-4 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9">
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
