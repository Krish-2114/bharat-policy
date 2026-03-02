"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { authActions } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthBackground } from "../ui/auth-background";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // OTP countdown timer
  useEffect(() => {
    if (timeLeft > 0 && step === "otp") {
      const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timeLeft, step]);

  // Step 1: Send OTP via real backend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    try {
      setLoading(true);
      setError("");
      await authActions.sendOtp(email);
      setStep("otp");
      setTimeLeft(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP — real backend validates and returns JWT
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Please enter a valid 6-digit OTP."); return; }
    try {
      setLoading(true);
      setError("");
      const user = await authActions.verifyOtp(email, otp);
      login(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || loading) return;
    try {
      setLoading(true);
      setError("");
      await authActions.sendOtp(email);
      setTimeLeft(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center w-full relative">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-sm rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 flex flex-col items-center backdrop-blur-sm bg-gradient-to-tr from-slate-950/80 to-slate-900/80">
        <div className="absolute -inset-1 blur-2xl transform-gpu bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 -z-10 rounded-full" />

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 mb-6 shadow-xl">
          <Shield className="w-7 h-7 text-cyan-400" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">Login</h2>
        <p className="text-sm text-slate-400 mb-8 text-center">
          {step === "email"
            ? "Enter your email to receive an OTP."
            : `OTP sent to ${email}`}
        </p>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col w-full gap-5">
            <input
              placeholder="Email address"
              type="email"
              value={email}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white font-semibold px-5 py-3.5 rounded-xl shadow-lg hover:bg-cyan-500 transition-all text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
            <div className="w-full text-center">
              <span className="text-[13px] text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
                  Signup
                </Link>
              </span>
            </div>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col w-full gap-5">
            <input
              placeholder="6-digit OTP"
              type="text"
              maxLength={6}
              value={otp}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              autoFocus
            />
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-cyan-600 text-white font-semibold px-5 py-3.5 rounded-xl shadow-lg hover:bg-cyan-500 transition-all text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
            </button>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || loading}
                className="text-[13px] font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 transition-colors"
              >
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                disabled={loading}
                className="text-[13px] text-slate-400 flex items-center gap-2 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
