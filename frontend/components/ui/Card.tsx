import { HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  hover = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -1 } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-[#111827] border border-white/5 rounded-xl
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
        transition-all duration-200
        hover:border-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
