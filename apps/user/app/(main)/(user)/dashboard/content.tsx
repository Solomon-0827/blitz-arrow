'use client';

import useGlobalStore from '@/config/use-global';
import { getStat } from '@/services/common/common';
import { queryApplicationConfig } from '@/services/user/subscribe';
import { queryUserSubscribe, resetUserSubscribeToken } from '@/services/user/user';
import { getPlatform } from '@/utils/common';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { differenceInDays, formatDate, isBrowser } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import Subscribe from '../subscribe/page';
import { SubscriptionCard } from '@/components/dashboard/subscription-card';

const platforms: (keyof API.ApplicationPlatform)[] = [
  'windows',
  'macos',
  'linux',
  'ios',
  'android',
  'harmony',
];

export default function Content() {
  const t = useTranslations('dashboard');
  const { getUserSubscribe, getAppSubLink } = useGlobalStore();

  const [protocol, setProtocol] = useState('');

  const {
    data: userSubscribe = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['queryUserSubscribe'],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });
  const { data: applications } = useQuery({
    queryKey: ['queryApplicationConfig'],
    queryFn: async () => {
      const { data } = await queryApplicationConfig();
      return data.data?.applications || [];
    },
  });
  const [platform, setPlatform] = useState<keyof API.ApplicationPlatform>(getPlatform());

  const { data } = useQuery({
    queryKey: ['getStat'],
    queryFn: async () => {
      const { data } = await getStat({
        skipErrorHandler: true,
      });
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {/* Platform and Protocol Tabs - Only show if we have subscriptions or data */}
      {(userSubscribe.length > 0 || (data?.protocol && data?.protocol.length > 0)) && (
        <div className='flex flex-wrap justify-between gap-4'>
          <Tabs
            value={platform}
            onValueChange={(value) => setPlatform(value as keyof API.ApplicationPlatform)}
            className='w-full max-w-full md:w-auto'
          >
            <TabsList className='flex *:flex-auto'>
              {platforms.map((item) => (
                <TabsTrigger value={item} key={item} className='px-1 lg:px-3'>
                  <Icon
                    icon={`${
                      {
                        windows: 'mdi:microsoft-windows',
                        macos: 'uil:apple',
                        linux: 'uil:linux',
                        ios: 'simple-icons:ios',
                        android: 'uil:android',
                        harmony: 'simple-icons:harmonyos',
                      }[item]
                    }`}
                    className='size-5'
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {data?.protocol && data?.protocol.length > 1 && (
            <Tabs
              value={protocol}
              onValueChange={setProtocol}
              className='w-full max-w-full md:w-auto'
            >
              <TabsList className='flex *:flex-auto'>
                {['all', ...(data?.protocol || [])].map((item) => (
                  <TabsTrigger
                    value={item === 'all' ? '' : item}
                    key={item}
                    className='px-1 uppercase lg:px-3'
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
      )}

      <div className='flex items-center justify-between'>
        <h2 className='flex items-center gap-1.5 font-semibold'>
          <Icon icon='uil:servers' className='size-5' />
          {t('mySubscriptions')}
        </h2>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              refetch();
            }}
            className={isLoading ? 'animate-pulse' : ''}
          >
            <Icon icon='uil:sync' />
          </Button>
          <Button size='sm' asChild>
            <Link href='/subscribe'>{t('purchaseSubscription')}</Link>
          </Button>
        </div>
      </div>

      {/* Subscription Cards */}
      {userSubscribe.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {userSubscribe.map((item) => (
            <SubscriptionCard
              key={item.id}
              subscription={item}
              onReset={async () => {
                await resetUserSubscribeToken({
                  user_subscribe_id: item.id,
                });
                await refetch();
                toast.success(t('resetSuccess'));
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Show purchase section when no subscriptions */}
      {userSubscribe.length === 0 && (
        <div className='space-y-6'>
          <div className='text-center py-12'>
            <Icon icon='uil:credit-card' className='size-16 mx-auto mb-4 text-muted-foreground opacity-50' />
            <h3 className='text-lg font-semibold mb-2'>{t('noSubscriptions')}</h3>
            <p className='text-muted-foreground mb-6'>{t('noSubscriptionsDesc')}</p>
          </div>

          <div className='border-t border-border/50 pt-6'>
            <h2 className='flex items-center gap-1.5 font-semibold mb-4'>
              <Icon icon='uil:shop' className='size-5' />
              {t('purchaseSubscription')}
            </h2>
            <Subscribe />
          </div>
        </div>
      )}
    </>
  );
}
