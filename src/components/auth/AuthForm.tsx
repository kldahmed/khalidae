"use client";
import { useState } from 'react';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' | 'forgot-password' | 'reset-password' }) {
  // Placeholder for actual form logic
  return (
    <form className="space-y-4">
      <div className="text-white/60">نموذج {mode} قادم قريبًا.</div>
    </form>
  );
}
