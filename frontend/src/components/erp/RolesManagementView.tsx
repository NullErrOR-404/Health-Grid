import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Users,
  Search,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Stethoscope,
  HeartPulse,
  UserCheck,
  Pill,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  rolesManagementService,
  type HospitalRoleAccount,
  PRESET_ROLES,
  generateUUID,
} from '../../services/rolesManagementService';
import { getHospitalsList } from '../../data/hospitalsList';

interface RolesManagementViewProps {
  triggerToast: (msg: string) => void;
}

export const RolesManagementView: React.FC<RolesManagementViewProps> = ({ triggerToast }) => {
  const [accounts, setAccounts] = useState<HospitalRoleAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');

  // Copy UUID / Password state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

  // Create Account Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formUuid, setFormUuid] = useState(() => generateUUID());
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('doctor');
  const [formHospitalCode, setFormHospitalCode] = useState('HG-H002');
  const [isFormPasswordVisible, setIsFormPasswordVisible] = useState(true);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hospitals = useMemo(() => getHospitalsList(), []);

  // Fetch accounts on load
  const loadAccounts = async () => {
    setIsLoading(true);
    const data = await rolesManagementService.getRoleAccounts();
    setAccounts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenCreateModal = () => {
    setFormUuid(generateUUID());
    setFormUsername('');
    setFormPassword('');
    setFormFullName('');
    setFormEmail('');
    setFormRole('doctor');
    setFormHospitalCode('HG-H002');
    setFormError(null);
    setIsFormPasswordVisible(true);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formUsername.trim()) {
      setFormError('Please enter a username.');
      return;
    }
    if (!formPassword.trim()) {
      setFormError('Please enter a password for this account.');
      return;
    }
    if (!formFullName.trim()) {
      setFormError('Please enter the full name.');
      return;
    }

    setIsSubmitting(true);
    const res = await rolesManagementService.createRoleAccount({
      id: formUuid.trim(),
      username: formUsername.trim(),
      password: formPassword.trim(),
      full_name: formFullName.trim(),
      email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@healthgrid.in`,
      role: formRole.trim(),
      hospital_code: formHospitalCode.trim(),
      status: 'ACTIVE',
    });

    setIsSubmitting(false);

    if (res.success) {
      triggerToast(`Account @${formUsername} created successfully with role ${formRole.toUpperCase()}!`);
      setIsCreateModalOpen(false);
      loadAccounts();
    } else {
      setFormError(res.error || 'Failed to create role account.');
    }
  };

  const handleDeleteAccount = async (account: HospitalRoleAccount) => {
    if (account.username === 'gmch_admin') {
      triggerToast('Cannot delete Root Super Admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete account @${account.username}?`)) {
      return;
    }

    setDeletingId(account.id);
    const res = await rolesManagementService.deleteRoleAccount(account.id, account.username);
    setDeletingId(null);

    if (res.success) {
      triggerToast(`Account @${account.username} deleted.`);
      loadAccounts();
    } else {
      triggerToast(res.error || 'Failed to delete account.');
    }
  };

  // Metrics
  const totalAccounts = accounts.length;
  const superAdminCount = accounts.filter(
    (a) => a.role?.toLowerCase() === 'superadmin' || a.role?.toUpperCase() === 'SUPER_ADMIN'
  ).length;
  const doctorCount = accounts.filter((a) => a.role?.toLowerCase() === 'doctor').length;
  const staffCount = accounts.filter(
    (a) =>
      a.role?.toLowerCase() !== 'superadmin' &&
      a.role?.toUpperCase() !== 'SUPER_ADMIN' &&
      a.role?.toLowerCase() !== 'doctor'
  ).length;

  // Filtered Accounts
  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      acc.full_name?.toLowerCase().includes(q) ||
      acc.username?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.id?.toLowerCase().includes(q) ||
      acc.role?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'ALL' ||
      acc.role?.toLowerCase() === roleFilter.toLowerCase();

    const matchesHospital =
      hospitalFilter === 'ALL' ||
      acc.hospital_code?.toUpperCase() === hospitalFilter.toUpperCase();

    return matchesSearch && matchesRole && matchesHospital;
  });

  const getRoleBadge = (roleName: string) => {
    const r = (roleName || '').toLowerCase();
    if (r === 'superadmin' || r === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          SUPER ADMIN
        </span>
      );
    }
    if (r === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-xs">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          HOSPITAL ADMIN
        </span>
      );
    }
    if (r === 'doctor') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 shadow-xs">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          DOCTOR / CLINICIAN
        </span>
      );
    }
    if (r === 'nurse') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
          <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
          NURSE / WARD
        </span>
      );
    }
    if (r === 'receptionist') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          RECEPTION DESK
        </span>
      );
    }
    if (r === 'pharmacist') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
          <Pill className="w-3.5 h-3.5 text-amber-600" />
          PHARMACIST
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Users className="w-3.5 h-3.5 text-slate-500" />
        {roleName.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                Super Admin Privilege
              </span>
              <span className="text-xs text-slate-400 font-mono">public.roles</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Hospital Roles &amp; User Accounts
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Centralized identity provisioning for HealthGrid ERP. Dynamically create accounts with custom UUIDs,
              secure passwords, and assign system permissions directly in Supabase PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAccounts}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Refresh Accounts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account / Role</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalAccounts}</div>
            <div className="text-[10px] text-slate-400 mt-1">Live in Supabase database</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs bg-gradient-to-br from-purple-50/30 to-white">
            <div className="flex items-center justify-between text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Super Admins</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-900">{superAdminCount}</div>
            <div className="text-[10px] text-purple-600 font-semibold mt-1">Full platform authority</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-xs bg-gradient-to-br from-teal-50/30 to-white">
            <div className="flex items-center justify-between text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Doctors / Clinicians</span>
              <Stethoscope className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-900">{doctorCount}</div>
            <div className="text-[10px] text-teal-600 font-semibold mt-1">OPD &amp; Inpatient care</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Hospital Staff</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{staffCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Nurses, desk &amp; admins</div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @username, or UUID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Hospital Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Reception Desk</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="hospital_staff">General Staff</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span>Facility:</span>
              <select
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Facilities</option>
                {hospitals.map((h) => (
                  <option key={h.code} value={h.code}>
                    {h.code} - {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ACCOUNTS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User / Account</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Facility Code</th>
                  <th className="py-3 px-4">UUID (Primary Key)</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                      Loading accounts from Supabase...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => {
                    const isSuper =
                      account.username === 'gmch_admin' ||
                      account.role?.toLowerCase() === 'superadmin' ||
                      account.role?.toUpperCase() === 'SUPER_ADMIN';
                    const isRevealed = revealedPasswords.has(account.id);

                    return (
                      <tr key={account.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* User / Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSuper
                                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/30'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {account.full_name
                                ? account.full_name.slice(0, 2).toUpperCase()
                                : account.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{account.full_name}</span>
                                {isSuper && (
                                  <span title="Super Admin">
                                    <Shield className="w-3.5 h-3.5 text-purple-600 inline-block" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                @{account.username}
                                {account.email && ` • ${account.email}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Role */}
                        <td className="py-3.5 px-4">{getRoleBadge(account.role)}</td>

                        {/* Facility Code */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {account.hospital_code || 'HG-H002'}
                          </span>
                        </td>

                        {/* UUID with 1-click copy */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span className="max-w-[140px] truncate" title={account.id}>
                              {account.id}
                            </span>
                            <button
                              onClick={() => handleCopy(account.id, `uuid-${account.id}`)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy full UUID"
                            >
                              {copiedKey === `uuid-${account.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Password with reveal toggle */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {isRevealed ? account.password || '(not set)' : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(account.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={isRevealed ? 'Hide Password' : 'Show Password'}
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {account.password && (
                              <button
                                onClick={() => handleCopy(account.password!, `pass-${account.id}`)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy Password"
                              >
                                {copiedKey === `pass-${account.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              account.status === 'INACTIVE'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                account.status === 'INACTIVE' ? 'bg-slate-400' : 'bg-emerald-500'
                              }`}
                            />
                            {account.status || 'ACTIVE'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {account.username === 'gmch_admin' ? (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Protected Root</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteAccount(account)}
                              disabled={deletingId === account.id}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE ACCOUNT DYNAMIC MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-tight">Create Dynamic Role Account</h3>
                  <p className="text-xs text-purple-100">
                    Direct Supabase insertion into <code className="font-mono bg-purple-800/40 px-1 rounded">public.roles</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Dynamic UUID Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Account UUID <span className="text-purple-600 font-mono">(Primary Key)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormUuid(generateUUID())}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate UUID
                  </button>
                </div>
                <input
                  type="text"
                  value={formUuid}
                  onChange={(e) => setFormUuid(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-generated standard RFC4122 v4 UUID. You can also type or paste any valid UUID.
                </p>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. dr_rajesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Password * <span className="text-slate-400 font-normal">(User-entered dynamically)</span>
                </label>
                <div className="relative">
                  <input
                    type={isFormPasswordVisible ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter dynamic password for this user"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsFormPasswordVisible(!isFormPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {isFormPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Email & Hospital Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. rajesh@gmch.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility / Hospital Code</label>
                  <select
                    value={formHospitalCode}
                    onChange={(e) => setFormHospitalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    {hospitals.map((h) => (
                      <option key={h.code} value={h.code}>
                        {h.code} - {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Set Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign System Role <span className="text-purple-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_ROLES.map((r) => {
                    const isSelected = formRole === r.value;
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => setFormRole(r.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="text-xs capitalize">{r.value}</div>
                        <div className="text-[10px] text-slate-400 truncate">{r.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save &amp; Insert into Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
