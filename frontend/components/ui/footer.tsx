"use client";

import React, { useState, type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logoSrc: string;
  companyName?: string;
  description?: string;
  usefulLinks?: { label: string; href: string }[];
  socialLinks?: { label: string; href: string; icon: ReactNode }[];
  newsletterTitle?: string;
  onSubscribe?: (email: string) => Promise<boolean>;
}

export const Footer: FC<FooterProps> = ({
  logoSrc,
  companyName = 'Bharat Policy Twin',
  description = 'Transforming national policy documents into an intelligent, searchable knowledge system powered by AI.',
  usefulLinks = [
    { label: 'Platform Features', href: '#' },
    { label: 'Technology', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
  socialLinks = [],
  newsletterTitle = 'Stay updated on public policy AI',
  onSubscribe,
  className,
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !onSubscribe || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSubscribe(email);

    setSubscriptionStatus(success ? 'success' : 'error');
    setIsSubmitting(false);

    if (success) {
      setEmail('');
    }

    setTimeout(() => {
      setSubscriptionStatus('idle');
    }, 3000);
  };

  return (
    <footer className={cn('bg-slate-950 border-t border-slate-800 text-slate-300 py-16', className)} {...props}>
      <div className="container mx-auto grid grid-cols-1 gap-12 px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 max-w-7xl">
        {/* Company Info */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={`${companyName} Logo`} className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 object-cover p-1 shadow-md" />
            <span className="text-xl font-bold text-slate-100">{companyName}</span>
          </div>
          <p className="text-sm text-slate-400 font-light leading-relaxed">{description}</p>
        </div>

        {/* Useful Links */}
        <div className="md:justify-self-center lg:justify-self-start lg:pl-10">
          <h3 className="mb-4 text-sm font-semibold text-slate-200 uppercase tracking-wider">Useful Links</h3>
          <ul className="space-y-3">
            {usefulLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400 font-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow Us */}
        <div className="md:justify-self-center lg:justify-self-start lg:pl-10">
          <h3 className="mb-4 text-sm font-semibold text-slate-200 uppercase tracking-wider">Social</h3>
          <ul className="space-y-3">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-label={link.label}
                  className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-cyan-400 font-light"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="lg:justify-self-end">
          <h3 className="mb-4 text-sm font-semibold text-slate-200 uppercase tracking-wider">{newsletterTitle}</h3>
          <form onSubmit={handleSubscribe} className="relative w-full max-w-sm">
            <div className="relative flex">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || subscriptionStatus !== 'idle'}
                required
                aria-label="Email for newsletter"
                className="pr-28 h-11"
              />
              <div className="absolute right-0 top-0 bottom-0">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || subscriptionStatus !== 'idle'}
                  className="h-full rounded-l-none px-5 text-sm"
                >
                  {isSubmitting ? '...' : 'Subscribe'}
                </Button>
              </div>
            </div>

            {(subscriptionStatus === 'success' || subscriptionStatus === 'error') && (
              <div
                key={subscriptionStatus}
                className="animate-in fade-in absolute inset-0 flex items-center justify-center rounded-md bg-slate-900/90 text-center backdrop-blur-sm z-10"
              >
                {subscriptionStatus === 'success' ? (
                  <span className="text-sm font-semibold text-emerald-400">Subscribed! 🎉</span>
                ) : (
                  <span className="text-sm font-semibold text-red-400">Failed. Try again.</span>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </footer>
  );
};
