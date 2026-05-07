import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  const spinner = (
    <motion.div
      className={`${sizes[size]} border-2 rounded-full`}
      style={{ borderColor: 'rgba(212,175,55,0.15)', borderTopColor: '#D4AF37' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#0A0A0F' }}>
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-yellow-400/70 text-sm font-medium tracking-wider">Loading FizzUp...</p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-12">{spinner}</div>;
}
