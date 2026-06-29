import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserMinus, 
  UserPlus, 
  Clock, 
  History, 
  Info, 
  X,
  Plus,
  Key
} from 'lucide-react';
import { User, AuditLog, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  auditLogs: AuditLog[];
  onInviteUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  onToggleUserStatus: (id: string) => void;
  userRole: string;
}

export default function UserManagement({
  users,
  auditLogs,
  onInviteUser,
  onToggleUserStatus,
  userRole
}: UserManagementProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'roles'>('users');

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('Inventory Staff');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInviteUser({
      name: newName,
      email: newEmail,
      role: newSelectedRole,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    });
    setInviteOpen(false);
    setNewName('');
    setNewEmail('');
  };

  const isSuperAdmin = userRole === 'Super Admin';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Security & RBAC Administration</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage operational security profiles, inspect structural access roles, and audit complete change logs.</p>
        </div>

        {activeTab === 'users' && isSuperAdmin && (
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs self-start md:self-auto"
          >
            <Plus className="h-4 w-4" /> Invite Operator
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'users' 
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Users className="h-4 w-4" /> Active System Operators
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'audit' 
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <History className="h-4 w-4" /> Operational Audit Telemetry
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-all duration-200 ${
            activeTab === 'roles' 
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Key className="h-4 w-4" /> Role Permissions Matrix
        </button>
      </div>

      {/* ACTIVE OPERATORS TAB */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Authorized Security Role</th>
                  <th className="px-6 py-4">Login History Tracker</th>
                  <th className="px-6 py-4 text-center">Operational Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800" />
                      <div>
                        <div className="font-semibold text-neutral-950 dark:text-white text-sm">{u.name}</div>
                        <div className="text-[10px] text-neutral-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-800 dark:text-neutral-300">
                        <ShieldCheck className="h-4.5 w-4.5 text-blue-500" /> {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-800 dark:text-neutral-200 font-medium">{u.lastLogin}</div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">● Authorized IP Session</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isSuperAdmin && u.role !== 'Super Admin' ? (
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 mx-auto ${
                            u.status === 'Active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          {u.status === 'Active' ? 'Deactivate Operator' : 'Reactivate Operator'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Administrative lock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPERATIONS AUDIT LOGGER TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-150 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-950/10 flex items-center gap-2 text-xs text-neutral-500 leading-relaxed">
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
            <span>Audit logging tracks every state change. Logs are immutable, recorded server-side with fully-resolved IP mapping.</span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-500 dark:text-neutral-400">
                <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Security User Details</th>
                    <th className="px-6 py-4">Transaction Code</th>
                    <th className="px-6 py-4">Action Details</th>
                    <th className="px-6 py-4 text-right">Scope Difference (Old → New)</th>
                    <th className="px-6 py-4 text-center">Terminal Host IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="px-6 py-4 font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-950 dark:text-white">{log.userName}</div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">{log.userRole}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-800 dark:text-neutral-200">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 text-right text-[10px] text-neutral-500">
                        {log.oldValue && log.newValue ? (
                          <div className="flex flex-col items-end">
                            <span className="text-red-500 font-semibold line-through">Old: {log.oldValue}</span>
                            <span className="text-emerald-500 font-bold mt-0.5">New: {log.newValue}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-[11px]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY MATRIX TAB */}
      {activeTab === 'roles' && (
        <div className="p-5 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-4">
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">System Operations Permission Matrix</h3>
          
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800 font-bold uppercase text-[9px]">
                <tr className="border-b">
                  <th className="p-4">Operations Target Module</th>
                  <th className="p-4 text-center">Super Admin</th>
                  <th className="p-4 text-center">Warehouse Manager</th>
                  <th className="p-4 text-center">Supplier</th>
                  <th className="p-4 text-center">Inventory Staff</th>
                  <th className="p-4 text-center">Finance Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y text-neutral-700 dark:text-neutral-300">
                <tr>
                  <td className="p-4 font-bold">Catalog CRUD / SKU Generation</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Asset Valuations / Finance Reports</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Purchase Approval Issuance</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Audit Logs Telemetry Logs</td>
                  <td className="p-4 text-center text-emerald-500">✔ Full Access</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                  <td className="p-4 text-center text-red-500">✖ Restricted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE DIALOG */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setInviteOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Authorize Operational Member</h3>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Operator Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Richard Hendricks"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. r.hendricks@enterprise.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-neutral-700 dark:text-neutral-300">Operational Access Scope (Role) *</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-850 dark:text-white"
                >
                  <option value="Super Admin">Super Admin (Universal Root)</option>
                  <option value="Warehouse Manager">Warehouse Manager (Local Hubs)</option>
                  <option value="Supplier">Supplier Portal Partner</option>
                  <option value="Inventory Staff">Inventory Staff (Catalog & scanning)</option>
                  <option value="Finance Manager">Finance Manager (Invoices & PO approvals)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Provision Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
