import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | RICO AI',
  description: 'Industrial AI Quality Control Platform — Secure Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient Radial Glowing Orbs Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Industrial Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#22D3EE 1px, transparent 1px)`,
          backgroundSize: `32px 32px`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {children}
      </div>
    </div>
  );
}
