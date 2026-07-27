'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services';
import { useAuthStore } from '@/store/authStore';

import { useRouter } from 'next/navigation';
import type { User } from '@/types';

export default function AdminPage() {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => AuthService.getUsers(),
    enabled: currentUser?.role === 'plant_admin',
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (email?: string) => AuthService.invite({ email }),
    onSuccess: (data) => {
      setInviteUrl(data.invite_url);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: (userId: number) => AuthService.toggleUserActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });


  // Redirect non-admins
  if (currentUser && currentUser.role !== 'plant_admin') {
    router.replace('/dashboard');
    return null;
  }

  const handleInvite = async () => {
    await inviteMutation.mutateAsync(inviteEmail || undefined);
    setShowInviteModal(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-cyan-400 tracking-tight leading-none uppercase">
            USER MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm font-medium">
            Manage your plant users and invite new team members
          </p>
        </div>
        <button
          onClick={handleInvite}
          disabled={inviteMutation.isPending}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0"
        >
          {inviteMutation.isPending ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Invite User
            </>
          )}
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && inviteUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">Invite Link Generated</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteUrl('');
                  setInviteEmail('');
                }}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-xs font-medium">
              Share this link with the user. It expires in 7 days and can only be used once.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 bg-[#0B1120] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-gray-300 outline-none font-mono truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors flex-shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional Email Input for Invite */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="email"
          placeholder="Pre-fill email in invite (optional)"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="flex-1 bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors font-medium"
        />
        <span className="text-gray-400 text-xs font-medium">
          Leave blank to generate a generic invite link
        </span>
      </div>

      {/* Users Section */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#252D3D] flex justify-between items-center">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-200">
            Plant Users
          </h2>
          <span className="text-gray-400 text-xs font-mono font-semibold">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            <div className="w-7 h-7 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-medium">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-xs font-medium">
              No users yet. Invite your first team member!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#252D3D]">
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-4 py-2.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3D]/50 text-xs font-semibold">
                  {users.map((u: User) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#1E293B]/40 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-cyan-400 font-extrabold text-[11px]">
                              {u.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">{u.full_name}</p>
                            <p className="text-gray-400 text-[11px] font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role === 'plant_admin'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                          }`}
                        >
                          {u.role === 'plant_admin' ? 'Plant Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            u.is_active ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                            }`}
                          />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-300 font-mono text-[11px]">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => toggleMutation.mutate(u.id)}
                            disabled={toggleMutation.isPending}
                            className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer ${
                              u.is_active
                                ? 'text-red-400 hover:bg-red-500/10 border border-red-500/30'
                                : 'text-green-400 hover:bg-green-500/10 border border-green-500/30'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-[#252D3D]">
              {users.map((u: User) => (
                <div key={u.id} className="p-3.5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-400 font-bold text-xs">
                          {u.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">{u.full_name}</p>
                        <p className="text-gray-400 text-[11px]">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'plant_admin'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {u.role === 'plant_admin' ? 'Admin' : 'User'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className={u.is_active ? 'text-green-400 font-bold text-xs' : 'text-gray-500 text-xs'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-gray-400 text-[11px] font-mono">• {formatDate(u.created_at)}</span>
                    </div>

                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleMutation.mutate(u.id)}
                        disabled={toggleMutation.isPending}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          u.is_active
                            ? 'text-red-400 border border-red-500/30'
                            : 'text-green-400 border border-green-500/30'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
