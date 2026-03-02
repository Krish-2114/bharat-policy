"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { authActions } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthBackground } from "../ui/auth-background";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (timeLeft > 0 && step === "otp") {
      const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timeLeft, step]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !aadhaar || !organization || !role || !email) {
      setError("Please fill in all registration fields.");
      return;
    }
    if (aadhaar.length !== 12) {
      setError("Aadhaar Number must be exactly 12 digits.");
      return;
    }
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center w-full relative py-12">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-lg rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 flex flex-col items-center backdrop-blur-sm bg-gradient-to-tr from-slate-950/80 to-slate-900/80 mt-10">
        <div className="absolute -inset-1 blur-2xl transform-gpu bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 -z-10 rounded-full" />

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 mb-4 shadow-xl">
          <Shield className="w-7 h-7 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">Signup</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">
          {step === "details" ? "Create your account." : `OTP sent to ${email}`}
        </p>

        {/* Step 1: Details */}
        {step === "details" && (
          <form onSubmit={handleSignUp} className="flex flex-col w-full gap-5">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                type="text"
                value={fullName}
                className="w-full px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all md:col-span-2"
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
                required
              />
              <input
                placeholder="Aadhaar Number (12 digits)"
                type="text"
                maxLength={12}
                value={aadhaar}
                className="w-full px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all md:col-span-2 tracking-widest"
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                required
              />
              <input
                placeholder="Organization / Agency"
                type="text"
                value={organization}
                className="w-full px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                onChange={e => setOrganization(e.target.value)}
                disabled={loading}
                required
              />
              <input
                placeholder="Role / Designation"
                type="text"
                value={role}
                className="w-full px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                onChange={e => setRole(e.target.value)}
                disabled={loading}
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={email}
                className="w-full px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all md:col-span-2 mt-2"
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 md:col-span-2">
                  {error}
                </div>
              )}
            </div>
            <hr className="border-slate-800 my-2" />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-semibold px-5 py-3.5 rounded-xl shadow-lg hover:bg-emerald-500 transition-all text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
            </button>
            <div className="w-full text-center">
              <span className="text-[13px] text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Log in
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
              className="w-full px-5 py-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
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
              className="w-full bg-emerald-600 text-white font-semibold px-5 py-3.5 rounded-xl shadow-lg hover:bg-emerald-500 transition-all text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Register'}
            </button>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || loading}
                className="text-[13px] font-medium text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 transition-colors"
              >
                {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => { setStep("details"); setOtp(""); setError(""); }}
                disabled={loading}
                className="text-[13px] text-slate-400 flex items-center gap-2 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
