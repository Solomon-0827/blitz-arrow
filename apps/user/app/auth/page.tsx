'use client';

import { OAuthMethods } from '@/components/auth/oauth-methods';
import LanguageSwitch from '@/components/language-switch';
import ThemeSwitch from '@/components/theme-switch';
import useGlobalStore from '@/config/use-global';
import { Card } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import EmailAuthForm from './email/auth-form';
import PhoneAuthForm from './phone/auth-form';

export default function Page() {
  const t = useTranslations('auth');
  const { common } = useGlobalStore();
  const { auth } = common;

  const AUTH_METHODS = [
    {
      key: 'email',
      enabled: auth.email.enable,
      children: <EmailAuthForm />,
    },
    {
      key: 'mobile',
      enabled: auth.mobile.enable,
      children: <PhoneAuthForm />,
    },
  ].filter((method) => method.enabled);

  return (
    <main className='bg-muted/50 flex min-h-screen items-center justify-center'>
      <div className='w-full px-5 md:px-0'>
        <Card className='mx-auto w-full max-w-[600px] p-10'>
          <div className='mb-6 flex w-full justify-center py-24'>
            <div className='relative h-12 w-auto'>
              {/* Light mode logo */}
              <Image
                src='/ba-light.svg'
                width={180}
                height={48}
                alt='logo'
                className='h-20 w-auto opacity-100 transition-opacity duration-300 dark:opacity-0'
                priority
              />
              {/* Dark mode logo */}
              <Image
                src='/ba.svg'
                width={180}
                height={48}
                alt='logo'
                className='absolute inset-0 h-20 w-auto opacity-0 transition-opacity duration-300 dark:opacity-100'
                priority
              />
            </div>
          </div>
          <div className='flex w-full flex-col items-stretch justify-center'>
            <div className='flex flex-col justify-center'>
              <h1 className='mb-3 text-center text-2xl font-bold'>{t('verifyAccount')}</h1>
              <div className='text-muted-foreground mb-6 text-center font-medium'>
                {t('verifyAccountDesc')}
              </div>
              {AUTH_METHODS.length === 1
                ? AUTH_METHODS[0]?.children
                : AUTH_METHODS[0] && (
                    <Tabs defaultValue={AUTH_METHODS[0].key}>
                      <TabsList className='mb-6 flex w-full *:flex-1'>
                        {AUTH_METHODS.map((item) => (
                          <TabsTrigger key={item.key} value={item.key}>
                            {t(`methods.${item.key}`)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {AUTH_METHODS.map((item) => (
                        <TabsContent key={item.key} value={item.key}>
                          {item.children}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
            </div>
            <div className='py-8'>
              <OAuthMethods />
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-5'>
                <LanguageSwitch />
                <ThemeSwitch />
              </div>
              <div className='text-primary flex gap-2 text-sm font-semibold'>
                <Link href='/tos'>{t('tos')}</Link>
                <span className='text-foreground/30'>|</span>
                <Link href='/privacy-policy'>{t('privacyPolicy')}</Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

