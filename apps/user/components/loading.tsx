'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LoadingProps {
  loading?: boolean;
}

export default function Loading({ loading = true }: LoadingProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const currentTheme = theme || resolvedTheme || 'light';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
        loading
          ? 'bg-background/95 pointer-events-auto opacity-100 backdrop-blur-[2px]'
          : 'pointer-events-none bg-transparent opacity-0 backdrop-blur-0'
      }`}
    >
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center space-y-6'>
          {/* Theme-aware logo */}
          <div className='relative mx-auto h-16 w-auto'>
            <Image
              src={currentTheme === 'dark' ? '/ba.svg' : '/ba-light.svg'}
              width={200}
              height={48}
              alt='logo'
              className='h-16 w-auto opacity-80'
              priority
            />
          </div>

          {/* Progress bar */}
          <div className='w-64 mx-auto'>
            <div className='w-full bg-muted/30 rounded-full h-2 overflow-hidden'>
              <div className='bg-primary h-full rounded-full animate-pulse' style={{ width: '60%' }}></div>
            </div>
            <p className='text-muted-foreground text-sm mt-2 font-mono'>Loading system...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
