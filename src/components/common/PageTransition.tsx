'use client';

import { motion } from 'framer-motion';
import { pageTransition, transitions } from '@/src/lib/animations';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitions.medium}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
