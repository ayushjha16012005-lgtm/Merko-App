'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, useToast } from '@merko/ui';
import { useAccessRequests, useUpdateAccessRequestStatus, useUpdateAdminPermissions } from '@/hooks/useAdmin';
import { ShieldCheck, Mail, Phone, Calendar, Building, MapPin, CheckCircle, XCircle, Ban, RefreshCw, Filter } from 'lucide-react';

const PERMISSIONS_LIST = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'payments', label: 'Payments' },
  { key: 'settings', label: 'Settings' },
  { key: 'reports', label: 'Reports' },
];

export default function AccessRequestsPage() {
  const { data: requests = [], isLoading, error } = useAccessRequests();
  const updateStatusMutation = useUpdateAccessRequestStatus();
  const updatePermissionsMutation = useUpdateAdminPermissions();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'>('PENDING_APPROVAL');

  const [editingPermissionsId, setEditingPermissionsId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const startEditingPermissions = (id: string, currentPerms: string[] = []) => {
    setEditingPermissionsId(id);
    setSelectedPermissions(currentPerms);
  };

  const handleAction = async (id: string, status: string, name: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast(`Admin "${name}" status updated to ${status} successfully.`, 'success');
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast(axiosError.response?.data?.error || 'Failed to update admin request status', 'error');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="warning" className="animate-pulse text-[9px] font-extrabold uppercase py-0.5 px-2">Pending Approval</Badge>;
      case 'ACTIVE':
        return <Badge variant="success" className="text-[9px] font-extrabold uppercase py-0.5 px-2">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 text-[9px] font-extrabold uppercase py-0.5 px-2">Rejected</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 text-[9px] font-extrabold uppercase py-0.5 px-2">Suspended</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] font-extrabold uppercase py-0.5 px-2">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl">
      {/* Header Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Verification</h1>
          <p className="text-sm text-slate-500 mt-1">
            Govern platform registration applications, approve merchant credentials, and audit administrative permissions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {[
          { key: 'PENDING_APPROVAL', label: 'Pending Queue' },
          { key: 'ACTIVE', label: 'Approved Admins' },
          { key: 'REJECTED', label: 'Rejected Applications' },
          { key: 'SUSPENDED', label: 'Suspended Accounts' },
          { key: 'ALL', label: 'All Applications' },
        ].map((tab) => {
          const count = tab.key === 'ALL' 
            ? requests.length 
            : requests.filter(r => r.status === tab.key).length;
            
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                filter === tab.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-550 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.25 text-[10px] font-bold ${
                filter === tab.key ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-405'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-bold text-red-650 dark:bg-red-950/20 dark:text-red-400">
          Failed to fetch admin requests. Verify Super Admin authorization.
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-white/40 dark:border-slate-850 dark:bg-slate-900/40 text-center p-12 shadow-sm">
          <CardContent className="space-y-2">
            <span className="text-4xl block">✨</span>
            <CardTitle className="text-slate-800 dark:text-slate-200 text-sm font-bold">No Applications Active</CardTitle>
            <p className="text-xs text-slate-450 max-w-sm mx-auto">
              There are currently no access requests matching this selection state.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                          {req.firstName} {req.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-semibold">
                          <Calendar className="h-3.5 w-3.5" /> Registered: {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1 text-xs">
                      {/* User Metadata */}
                      <div className="grid grid-cols-2 gap-3 text-slate-550 dark:text-slate-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate" title={req.email}>{req.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>{req.phone || 'No phone'}</span>
                        </div>
                      </div>

                      {/* Business info block */}
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-200/50 dark:border-slate-800/60 space-y-2">
                        <div className="flex gap-2 items-start">
                          <Building className="h-4 w-4 text-indigo-650 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{req.businessName || 'Independent Merchant'}</p>
                            <p className="text-[9px] text-slate-400 font-medium">Business Identity</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-start text-slate-650 dark:text-slate-350 font-medium">
                          <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="leading-tight">{req.businessAddress || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Audit History Block */}
                      {(req.approvedBy || req.rejectedBy || req.suspendedBy) && (
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-200/50 dark:border-slate-800/60 space-y-1 text-[10px]">
                          <p className="font-bold text-slate-700 dark:text-slate-350">Verification Log</p>
                          {req.approvedBy && (
                            <p className="text-slate-500 font-medium">
                              Approved by: <span className="text-slate-800 dark:text-slate-200">{req.approvedBy}</span> on {new Date(req.approvedAt!).toLocaleString()}
                            </p>
                          )}
                          {req.rejectedBy && (
                            <p className="text-slate-500 font-medium">
                              Rejected by: <span className="text-slate-800 dark:text-slate-200">{req.rejectedBy}</span> on {new Date(req.rejectedAt!).toLocaleString()}
                            </p>
                          )}
                          {req.suspendedBy && (
                            <p className="text-slate-500 font-medium">
                              Suspended by: <span className="text-slate-800 dark:text-slate-200">{req.suspendedBy}</span> on {new Date(req.suspendedAt!).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Permissions Manager Block */}
                      {editingPermissionsId === req.id ? (
                        <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200/50 dark:border-slate-800/60 animate-in fade-in zoom-in-95 duration-150">
                          <p className="font-bold text-xs text-slate-850 dark:text-slate-150">Select Administrative Scopes</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PERMISSIONS_LIST.map((p) => (
                              <label key={p.key} className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(p.key)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPermissions([...selectedPermissions, p.key]);
                                    } else {
                                      setSelectedPermissions(selectedPermissions.filter(k => k !== p.key));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                />
                                <span>{p.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button
                              onClick={() => setEditingPermissionsId(null)}
                              variant="outline"
                              className="h-7 text-[10px] font-bold px-3"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  await updatePermissionsMutation.mutateAsync({
                                    id: req.id,
                                    permissions: selectedPermissions,
                                  });
                                  toast('Permissions updated successfully.', 'success');
                                  setEditingPermissionsId(null);
                                } catch (err) {
                                  toast('Failed to update permissions.', 'error');
                                }
                              }}
                              disabled={updatePermissionsMutation.isPending}
                              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 h-7 text-[10px] font-bold px-3"
                            >
                              {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Scopes'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        req.status === 'ACTIVE' && (
                          <div className="space-y-1">
                            <p className="font-bold text-[10px] text-slate-550 dark:text-slate-400">Active Scopes:</p>
                            <div className="flex flex-wrap gap-1">
                              {req.permissions && req.permissions.length > 0 ? (
                                req.permissions.map((p) => (
                                  <Badge key={p} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold py-0.5 px-2 capitalize">
                                    {p}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No permissions assigned</span>
                              )}
                            </div>
                            <Button
                              onClick={() => startEditingPermissions(req.id, req.permissions || [])}
                              variant="outline"
                              className="mt-2 h-7 text-[10px] font-bold w-full"
                            >
                              Manage Scopes
                            </Button>
                          </div>
                        )
                      )}
                    </CardContent>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 justify-end p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
                    {req.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          onClick={() => handleAction(req.id, 'ACTIVE', `${req.firstName} ${req.lastName}`)}
                          disabled={updateStatusMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 h-8 text-xs font-bold"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(req.id, 'REJECTED', `${req.firstName} ${req.lastName}`)}
                          disabled={updateStatusMutation.isPending}
                          variant="destructive"
                          className="flex items-center gap-1.5 h-8 text-xs font-bold"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    {req.status === 'ACTIVE' && (
                      <Button
                        onClick={() => handleAction(req.id, 'SUSPENDED', `${req.firstName} ${req.lastName}`)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 h-8 text-xs font-bold"
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </Button>
                    )}
                    {req.status === 'SUSPENDED' && (
                      <Button
                        onClick={() => handleAction(req.id, 'ACTIVE', `${req.firstName} ${req.lastName}`)}
                        disabled={updateStatusMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 h-8 text-xs font-bold"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reactivate
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
