'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
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
import { toast } from 'sonner';
import CopyToClipboard from 'react-copy-to-clipboard';

interface SubscriptionCardProps {
  subscription: API.UserSubscribe;
  onReset: () => void;
}

export function SubscriptionCard({ subscription, onReset }: SubscriptionCardProps) {
  const t = useTranslations('dashboard');
  const [copiedText, setCopiedText] = useState('');

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 1:
        return <Badge variant='secondary' className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>{t('active')}</Badge>;
      case 2:
        return <Badge variant='destructive'>{t('finished')}</Badge>;
      case 3:
        return <Badge variant='outline'>{t('expired')}</Badge>;
      case 4:
        return <Badge variant='outline'>{t('deducted')}</Badge>;
      default:
        return <Badge variant='secondary'>{t('unknown')}</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 1:
        return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50';
      case 2:
        return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50';
      case 3:
        return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50';
      case 4:
        return 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/50';
      default:
        return '';
    }
  };

  const handleCopySuccess = (text: string, result: boolean) => {
    if (result) {
      setCopiedText(text);
      toast.success(t('copySuccess'));
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  return (
    <Card className={cn(
      'group relative overflow-hidden rounded-3xl border border-border/60 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-lg',
      subscription.status !== 1 && 'opacity-80 grayscale',
      subscription.status === 4 && 'hidden',
      getStatusColor()
    )}>
      {/* Status Overlay for non-active subscriptions */}
      {subscription.status !== 1 && (
        <div className='absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center'>
          <div className='text-center'>
            <Icon icon='uil:ban' className='size-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm font-medium text-muted-foreground'>{getStatusBadge()}</p>
          </div>
        </div>
      )}

      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-lg font-semibold leading-tight'>
              {subscription.subscribe.name}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              {t('started')}: {formatDate(subscription.start_time)}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Usage Stats */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>{t('used')}</p>
            <p className='text-2xl font-bold text-primary'>
              {subscription.traffic ? (
                `${Math.round((subscription.upload + subscription.download) / subscription.traffic * 100)}%`
              ) : (
                t('unlimited')
              )}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>{t('totalTraffic')}</p>
            <p className='text-xl font-semibold'>
              {subscription.traffic ? (
                `${Math.round(subscription.traffic / (1024 * 1024 * 1024))} GB`
              ) : (
                t('unlimited')
              )}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>{t('nextResetDays')}</p>
            <p className='text-xl font-semibold'>
              {subscription.reset_time ? (
                `${Math.max(0, Math.ceil((new Date(subscription.reset_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}`
              ) : (
                t('noReset')
              )}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-1'>{t('expirationDays')}</p>
            <p className='text-xl font-semibold'>
              {subscription.expire_time ? (
                `${Math.max(0, Math.ceil((new Date(subscription.expire_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}`
              ) : (
                t('noLimit')
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {subscription.status === 1 && (
          <div className='flex flex-wrap gap-2 pt-4 border-t border-border/50'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size='sm' variant='destructive' className='flex items-center gap-2'>
                  <Icon icon='uil:refresh' className='size-4' />
                  {t('resetSubscription')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('prompt')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('confirmResetSubscription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>
                    {t('confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button size='sm' variant='outline' className='flex items-center gap-2'>
              <Icon icon='uil:copy' className='size-4' />
              {t('copyUrl')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

