'use client';

import useGlobalStore from '@/config/use-global';
import { buttonVariants } from '@workspace/ui/components/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitch from './language-switch';
import ThemeSwitch from './theme-switch';
import { UserNav } from './user-nav';

export default function Header() {
  const t = useTranslations('common');

  const { common, user } = useGlobalStore();
  const { site } = common;

  const Logo = (
    <Link href='/' className='flex items-center gap-3 text-lg font-bold'>
      <div className='relative h-7 w-auto'>
        {/* Light mode logo */}
        <Image
          src='/ba-light.svg'
          width={120}
          height={28}
          alt='logo'
          className='h-7 w-auto opacity-100 dark:opacity-0 transition-opacity duration-300'
          priority
        />
        {/* Dark mode logo */}
        <Image
          src='/ba.svg'
          width={120}
          height={28}
          alt='logo'
          className='absolute inset-0 h-7 w-auto opacity-0 dark:opacity-100 transition-opacity duration-300'
          priority
        />
      </div>
    </Link>
  );
  
  return (
    <header className='sticky top-0 z-50 w-full px-4 py-3'>
      <div className='bg-background/80 flex h-14 w-full items-center justify-between rounded-full border border-border backdrop-blur-xl px-6'>
        <nav className='flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
          {Logo}
        </nav>
        <div className='flex flex-1 items-center justify-end gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
          <UserNav />
          {!user && (
            <Link
              href='/auth'
              className={buttonVariants({
                size: 'sm',
              })}
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
