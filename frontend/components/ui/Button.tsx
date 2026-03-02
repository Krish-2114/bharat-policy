"use client";

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyle =
    'flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-400 text-white',
    secondary:
      'bg-[#111827] border border-white/5 hover:border-white/10 text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500 hover:bg-red-400 text-white',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
