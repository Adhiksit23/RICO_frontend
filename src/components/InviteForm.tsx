'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRegisterViaInvite } from '@/hooks/useAuth';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function InviteForm({ token }: { token: string }) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');

  const registerMutation = useRegisterViaInvite();

  useEffect(() => {
    if (!token || token === 'default') {
      setTokenValid(false);
      setTokenError('Invalid invite link. Please ask your Plant Admin for a new one.');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) { setError('Full name is required.'); return; }
    if (!formData.email.trim()) { setError('Email is required.'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirm_password) { setError('Passwords do not match.'); return; }

    try {
      await registerMutation.mutateAsync({
        token,
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Registration failed. Your invite may have expired.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  if (tokenValid === null) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Validating invite link...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Invalid Invite Link</h2>
          <p className="text-gray-500 text-sm mb-6">{tokenError}</p>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">R</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-white">RICO</span>
        </div>
        <p className="text-gray-500 text-sm">You&apos;ve been invited to join RICO</p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white mb-1">Complete Your Registration</h1>
        <p className="text-gray-500 text-sm mb-8">Set up your RICO account to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com' },
          ].map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                value={formData[f.name as keyof FormData]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-[#0B1120] border border-[#252D3D] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="w-full bg-[#0B1120] border border-[#252D3D] rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Toggle password"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full bg-[#0B1120] border border-[#252D3D] rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {registerMutation.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
