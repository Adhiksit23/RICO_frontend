'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSignup } from '@/hooks/useAuth';

interface FormData {
  full_name: string;
  email: string;
  plant_name: string;
  password: string;
  confirm_password: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    plant_name: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signupMutation = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!formData.full_name.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email.';
    if (!formData.plant_name.trim()) return 'Plant / company name is required.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await signupMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        plant_name: formData.plant_name.trim(),
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Registration failed. This email may already be in use.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const textFields = [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com', autoComplete: 'email' },
    { name: 'plant_name', label: 'Plant / Company Name', type: 'text', placeholder: 'Suzuki HPDC Plant #1', autoComplete: 'organization' },
  ] as const;

  return (
    <div className="w-full">
      {/* Branding Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-black font-black text-xl tracking-tighter">R</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">RICO AI</span>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm tracking-wide">
          Industrial Quality Control & Telemetry Platform
        </p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Create Plant Admin</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Register as a Plant Administrator to manage team access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text fields */}
          {textFields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className="w-full bg-[#0B1120] border border-[#252D3D] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
              />
            </div>
          ))}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full bg-[#0B1120] border border-[#252D3D] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Re-enter password"
              className="w-full bg-[#0B1120] border border-[#252D3D] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mt-2"
          >
            {signupMutation.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800/80 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-500 mt-6 font-mono">
        RICO Quality Control • System Version 2026.1
      </p>
    </div>
  );
}
