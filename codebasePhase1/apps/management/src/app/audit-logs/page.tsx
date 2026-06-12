'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAdmin';
import { Card, CardContent, CardTitle, Badge, Input, Button, Dialog, DialogHeader, DialogTitle, DialogFooter } from '@merko/ui';
import { ShieldAlert, Search, Calendar, User, Eye, EyeOff, Laptop, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, error } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const searchString = `${log.action} ${log.resource} ${log.actorRole || ''} ${log.userId || ''} ${log.ipAddress || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getActionBadge = (action: string) => {
    if (action.includes('Approved') || action.includes('Activated')) {
      return <Badge variant="success" className="text-[9px] font-extrabold uppercase py-0.5 px-2">Approved</Badge>;
    }
    if (action.includes('Rejected') || action.includes('Removed')) {
      return <Badge variant="secondary" className="bg-red-50 text-red-750 border border-red-200 dark:bg-red-950/40 dark:text-red-400 text-[9px] font-extrabold uppercase py-0.5 px-2">Rejected</Badge>;
    }
    if (action.includes('Suspended')) {
      return <Badge variant="warning" className="text-[9px] font-extrabold uppercase py-0.5 px-2">Suspended</Badge>;
    }
    return <Badge variant="secondary" className="text-[9px] font-extrabold uppercase py-0.5 px-2">{action}</Badge>;
  };

  return (
    <div className="space-y-6 py-4 max-w-6xl text-slate-900 dark:text-slate-100">
      {/* Header Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-indigo-600" /> Platform Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log record of security actions, user state updates, and administrative events.
          </p>
        </div>
      </div>

      {/* Control Filters Block */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search audit trail by actor, IP address, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-transparent"
            />
          </div>
          <div className="text-xs font-semibold text-slate-455 dark:text-slate-400">
            Audit history contains {filteredLogs.length} events
          </div>
        </CardContent>
      </Card>

      {/* Logs Table / List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-bold text-red-650 dark:bg-red-950/20 dark:text-red-400">
          Failed to fetch audit logs. Verify administrative permissions.
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-white/40 dark:border-slate-850 dark:bg-slate-900/40 text-center p-12 shadow-sm">
          <CardContent className="space-y-2">
            <span className="text-4xl block">📋</span>
            <CardTitle className="text-slate-805 dark:text-slate-200 text-sm font-bold">No Audit Logs Match</CardTitle>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any security events matching your current query parameters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Actor / Role</th>
                    <th className="px-5 py-3">Action performed</th>
                    <th className="px-5 py-3">Resource / ID</th>
                    <th className="px-5 py-3">IP Address</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    
                    return (
                      <tr 
                        key={log.id} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition ${
                          isExpanded ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(log.createdAt).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="font-mono">{log.userId ? log.userId.substring(0, 8) + '...' : 'System'}</span>
                            <Badge variant="secondary" className="text-[9px] px-1 font-mono uppercase bg-slate-105 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-extrabold">
                              {log.actorRole || 'SYSTEM'}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700 dark:text-slate-305">{log.resource}</span>
                          {log.resourceId && ` / ${log.resourceId.substring(0, 8)}...`}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Laptop className="h-3.5 w-3.5 text-slate-400" />
                            {log.ipAddress || 'Internal'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-indigo-650 hover:text-indigo-800 dark:text-indigo-400"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" /> Collapse
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" /> Inspect
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expandable change trace overlay */}
      <AnimatePresence>
        {expandedLogId && (
          <Dialog isOpen={!!expandedLogId} onClose={() => setExpandedLogId(null)} className="max-w-xl bg-slate-950 text-indigo-300 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white text-base">Metadata Changes Inspection</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-3 font-mono text-[10px] text-indigo-300 overflow-x-auto max-h-[60vh] overflow-y-auto">
              {(() => {
                const logObj = logs.find(l => l.id === expandedLogId);
                if (!logObj) return null;
                return (
                  <>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 border-b border-slate-800 pb-2 mb-2">
                      <span>METADATA PAYLOAD DETAIL</span>
                      <span className="flex items-center gap-1"><Compass className="h-3 w-3" /> User Agent: {logObj.userAgent || 'None'}</span>
                    </div>
                    {logObj.changes ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(JSON.parse(logObj.changes), null, 2)}</pre>
                    ) : (
                      <p className="text-slate-500 italic">No state delta payload recorded for this event action.</p>
                    )}
                  </>
                );
              })()}
            </div>
            <DialogFooter className="border-t border-slate-900 pt-3">
              <Button onClick={() => setExpandedLogId(null)} className="bg-slate-900 text-white hover:bg-slate-850 h-8 text-xs font-bold border border-slate-805">
                Close Inspector
              </Button>
            </DialogFooter>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
