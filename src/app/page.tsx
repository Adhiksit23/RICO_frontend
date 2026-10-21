"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rico_token') : null;
    if (token) {
      router.replace("/dashboard/");
    } else {
      router.replace("/login/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );
}