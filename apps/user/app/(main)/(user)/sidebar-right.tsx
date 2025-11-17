'use client';

import { Display } from '@/components/display';
import Recharge from '@/components/subscribe/recharge';
import useGlobalStore from '@/config/use-global';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { Icon } from '@workspace/ui/custom-components/icon';
import { isBrowser } from '@workspace/ui/utils';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'sonner';

export function SidebarRight({ className, ...props }: React.ComponentProps<'aside'>) {
  const { user } = useGlobalStore();
  const t = useTranslations('layout');

  return (
    <aside className={cn('flex flex-col gap-4 overflow-y-auto p-4', className)} {...props}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('accountBalance')}</CardTitle>
            <Recharge variant='link' className='p-0' />
          </CardHeader>
          <CardContent className='p-3 text-2xl font-bold'>
            <Display type='currency' value={user?.balance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-0 p-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('giftAmount')}</CardTitle>
          </CardHeader>
          <CardContent className='p-3 text-2xl font-bold'>
            <Display type='currency' value={user?.gift_amount} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-0 p-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('commission')}</CardTitle>
          </CardHeader>
          <CardContent className='p-3 text-2xl font-bold'>
            <Display type='currency' value={user?.commission} />
          </CardContent>
        </Card>
        {user?.refer_code && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
              <CardTitle className='text-sm font-medium'>{t('inviteCode')}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CopyToClipboard
                      text={`${isBrowser() && location?.origin}/auth?invite=${user?.refer_code}`}
                      onCopy={(text, result) => {
                        if (result) {
                          toast.success(t('copySuccess'));
                        }
                      }}
                    >
                      <Button variant='ghost' className='size-5 p-0'>
                        <Icon icon='mdi:content-copy' className='text-primary text-2xl' />
                      </Button>
                    </CopyToClipboard>
                  </TooltipTrigger>
                  <TooltipContent>{t('copyInviteLink')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className='truncate p-3 font-bold'>{user?.refer_code}</CardContent>
          </Card>
        )}
    </aside>
  );
}
