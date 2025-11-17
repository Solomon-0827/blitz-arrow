'use client';

import useGlobalStore from '@/config/use-global';
import { HoverBorderGradient } from '@workspace/ui/components/hover-border-gradient';
import { Icon } from '@workspace/ui/custom-components/icon';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  const t = useTranslations('index');
  const { user } = useGlobalStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      viewport={{ once: true, amount: 0.2 }}
      className='grid min-h-[75vh] gap-8 pt-[24vh] sm:grid-cols-2'
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className='sm:col-span-2 flex w-full items-center justify-center'
      >
        <div className='relative w-full px-6 sm:px-10 py-16 sm:py-24'>
          {/* Light mode full-width logo */}
          <Image
            src='/ba-full-lg-light.svg'
            width={417}
            height={96}
            alt='logo'
            className='w-full h-auto opacity-100 transition-opacity duration-500 dark:opacity-0'
            priority
          />
          {/* Dark mode full-width logo */}
          <Image
            src='/ba-full-lg.svg'
            width={417}
            height={96}
            alt='logo'
            className='absolute inset-0 w-full h-auto opacity-0 transition-opacity duration-500 dark:opacity-100'
            priority
          />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.3 }}
        viewport={{ once: true, amount: 0.3 }}
        className='flex flex-col items-start justify-center'
      >
        <div className='mb-4 flex items-center gap-2'>
          <div className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
            Quiet. Reliable. Built to last.
          </div>
        </div>
        <h1 className='my-2 whitespace-nowrap text-3xl font-bold tracking-tight lg:text-5xl'>
          Secure Networking Solutions
        </h1>
        <p className='text-muted-foreground mb-6 max-w-xl text-lg'>
          End-To-End encryption based networking provider
        </p>
        <div className='mb-8 flex flex-wrap gap-2'>
          <div className='flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs'>
            <Icon icon='uil:shield-check' className='size-4 text-muted-foreground' />
            <span className='text-muted-foreground'>Hardened core</span>
          </div>
          <div className='flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs'>
            <Icon icon='uil:lock' className='size-4 text-muted-foreground' />
            <span className='text-muted-foreground'>End-to-end by default</span>
          </div>
          <div className='flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs'>
            <Icon icon='uil:globe' className='size-4 text-muted-foreground' />
            <span className='text-muted-foreground'>Multi-region presence</span>
          </div>
        </div>
        <Link href={user ? '/dashboard' : '/auth'}>
          <HoverBorderGradient
            containerClassName='rounded-full'
            as='button'
            className='m-0.5 flex items-center space-x-2 text-white'
          >
            <Icon icon='uil:shield' className='size-5' />
            {user ? t('accessSecure') : t('started')}
          </HoverBorderGradient>
        </Link>
      </motion.div>
      
    </motion.div>
  );
}
