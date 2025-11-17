'use client';

import { motion } from 'framer-motion';

export function LandingBackground() {
  return (
    <motion.div className='pointer-events-none fixed inset-0 z-0 flex items-center justify-center' aria-hidden>
      {/* Subtle page linear gradient */}
      <div
        className='absolute inset-0'
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.025), rgba(0,0,0,0.015))',
        }}
      />

      {/* Tiled SVG grid */}
      <div
        className='absolute inset-0 opacity-10'
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M0 31h32M31 0v32\" stroke=\"%23ffffff\" stroke-opacity=\"0.15\" stroke-width=\"1\"/></svg>')",
          backgroundSize: '32px 32px',
        }}
      />

      <div className='relative'>
        <motion.div
          className='h-[96rem] w-[96rem] blur-3xl'
          style={{
            background:
              'radial-gradient(closest-side, rgba(234,179,8,0.25), transparent 65%)',
          }}
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 22, ease: 'easeInOut' }}
        />

        {/* Subtle primary glitch ring */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div
            className='h-[90rem] w-[90rem]'
            style={{
              WebkitMaskImage:
                'radial-gradient(closest-side, transparent calc(50% - 1px), #000 calc(50% - 1px), #000 calc(50% + 1px), transparent calc(50% + 1px))',
              maskImage:
                'radial-gradient(closest-side, transparent calc(50% - 1px), #000 calc(50% - 1px), #000 calc(50% + 1px), transparent calc(50% + 1px))',
            }}
          >
            <motion.div
              className='h-full w-full'
              style={{
                background:
                  'repeating-conic-gradient(hsl(var(--primary) / 0.08) 0deg 6deg, transparent 6deg 12deg)',
              }}
              initial={{ rotate: 0, opacity: 0.4 }}
              animate={{ rotate: [0, 1, -1, 0.6, 0], scale: [1, 1.002, 0.999, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}


