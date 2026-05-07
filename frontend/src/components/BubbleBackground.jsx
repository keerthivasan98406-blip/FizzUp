import React from 'react';
import { motion } from 'framer-motion';

const orbs = [
  { size: 500, x: '5%',  y: '10%', delay: 0,   color: 'rgba(212,175,55,0.04)' },
  { size: 350, x: '75%', y: '5%',  delay: 2,   color: 'rgba(59,130,246,0.04)' },
  { size: 280, x: '55%', y: '65%', delay: 4,   color: 'rgba(212,175,55,0.03)' },
  { size: 400, x: '20%', y: '70%', delay: 1,   color: 'rgba(168,85,247,0.03)' },
  { size: 200, x: '88%', y: '45%', delay: 3,   color: 'rgba(212,175,55,0.05)' },
];

export default function BubbleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size, height: o.size,
            left: o.x, top: o.y,
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{ y: [0, -30, 0], scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8 + i * 2, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(212,175,55,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.8) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.7) 100%)'
      }} />
    </div>
  );
}
