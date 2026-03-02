"use client";

import React from 'react';
import { Footer } from '@/components/ui/footer';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function FooterSection() {
  const handleNewsletterSubscribe = async (email: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Simulate a high success rate
    if (Math.random() > 0.1) {
      return true;
    } else {
      return false;
    }
  };

  const socialLinksData = [
    { label: 'Facebook', href: '#', icon: <Facebook className="w-4 h-4" /> },
    { label: 'Instagram', href: '#', icon: <Instagram className="w-4 h-4" /> },
    { label: 'Twitter (X)', href: '#', icon: <Twitter className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-slate-950">
      <Footer
        // Use a generic sophisticated AI brain logo or geometric shape from unsplash
        logoSrc="https://plus.unsplash.com/premium_photo-1683120966127-14162cdd0935?q=80&w=200&auto=format&fit=crop"
        onSubscribe={handleNewsletterSubscribe}
        socialLinks={socialLinksData}
      />
    </div>
  );
}
