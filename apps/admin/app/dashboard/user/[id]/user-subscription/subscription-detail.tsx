'use client';

import { Display } from '@/components/display';
import { IpLink } from '@/components/ip-link';
import { ProTable } from '@/components/pro-table';
import {
  getUserSubscribeDevices,
  getUserSubscribeLogs,
  getUserSubscribeTrafficLogs,
  kickOfflineByUserDevice,
} from '@/services/admin/user';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Switch } from '@workspace/ui/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionDetail({
  trigger,
  userId,
  subscriptionId,
}: {
  trigger: ReactNode;
  userId: number;
  subscriptionId: number;
}) {
  const t = useTranslations('user');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>{t('subscriptionDetails')}</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <Tabs defaultValue='logs'>
            <TabsList className='w-full'>
              <TabsTrigger value='logs' className='flex-1'>
                {t('subscriptionLogs')}
              </TabsTrigger>
              <TabsTrigger value='traffic' className='flex-1'>
                {t('trafficLogs')}
              </TabsTrigger>
              <TabsTrigger value='devices' className='flex-1'>
                {t('onlineDevices')}
              </TabsTrigger>
            </TabsList>
            <div className='mt-4 max-h-[60dvh] overflow-y-auto'>
              <TabsContent value='logs'>
                <ProTable<API.UserSubscribeLog, Record<string, unknown>>
                  columns={[
                    {
                      accessorKey: 'ip',
                      header: 'IP',
                      cell: ({ row }) => <IpLink ip={row.getValue('ip')} />,
                    },
                    {
                      accessorKey: 'user_agent',
                      header: t('userAgent'),
                    },
                    {
                      accessorKey: 'token',
                      header: t('token'),
                    },
                    {
                      accessorKey: 'created_at',
                      header: t('time'),
                      cell: ({ row }) => formatDate(row.getValue('created_at')),
                    },
                  ]}
                  request={async (pagination) => {
                    const { data } = await getUserSubscribeLogs({
                      user_id: userId,
                      subscribe_id: subscriptionId,
                      ...pagination,
                    });
                    return {
                      list: data.data?.list || [],
                      total: data.data?.total || 0,
                    };
                  }}
                />
              </TabsContent>
              <TabsContent value='traffic'>
                <ProTable<API.TrafficLog, Record<string, unknown>>
                  columns={[
                    {
                      accessorKey: 'download',
                      header: t('download'),
                      cell: ({ row }) => (
                        <Display type='traffic' value={row.getValue('download')} />
                      ),
                    },
                    {
                      accessorKey: 'upload',
                      header: t('upload'),
                      cell: ({ row }) => <Display type='traffic' value={row.getValue('upload')} />,
                    },
                    {
                      accessorKey: 'timestamp',
                      header: t('time'),
                      cell: ({ row }) => formatDate(row.getValue('timestamp')),
                    },
                  ]}
                  request={async (pagination) => {
                    const { data } = await getUserSubscribeTrafficLogs({
                      user_id: userId,
                      subscribe_id: subscriptionId,
                      ...pagination,
                    } as API.GetUserSubscribeTrafficLogsParams);
                    return {
                      list: data.data?.list || [],
                      total: data.data?.total || 0,
                    };
                  }}
                />
              </TabsContent>
              <TabsContent value='devices'>
                <ProTable<API.UserDevice, Record<string, unknown>>
                  columns={[
                    {
                      accessorKey: 'enabled',
                      header: t('enable'),
                      cell: ({ row }) => (
                        <Switch
                          checked={row.getValue('enabled')}
                          onChange={(checked) => {
                            console.log('Switch:', checked);
                          }}
                        />
                      ),
                    },
                    {
                      accessorKey: 'id',
                      header: 'ID',
                    },
                    {
                      accessorKey: 'identifier',
                      header: 'IMEI',
                    },
                    {
                      accessorKey: 'user_agent',
                      header: t('userAgent'),
                    },
                    {
                      accessorKey: 'ip',
                      header: 'IP',
                      cell: ({ row }) => <IpLink ip={row.getValue('ip')} />,
                    },
                    {
                      accessorKey: 'online',
                      header: t('loginStatus'),
                      cell: ({ row }) => (
                        <Badge variant={row.getValue('online') ? 'default' : 'destructive'}>
                          {row.getValue('online') ? t('online') : t('offline')}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: 'updated_at',
                      header: t('lastSeen'),
                      cell: ({ row }) => formatDate(row.getValue('updated_at')),
                    },
                  ]}
                  request={async (pagination) => {
                    const { data } = await getUserSubscribeDevices({
                      user_id: userId,
                      subscribe_id: subscriptionId,
                      ...pagination,
                    });
                    return {
                      list: data.data?.list || [],
                      total: data.data?.total || 0,
                    };
                  }}
                  actions={{
                    render: (row) => {
                      if (!row.identifier) return [];
                      return [
                        <ConfirmButton
                          key='offline'
                          trigger={<Button variant='destructive'>{t('confirmOffline')}</Button>}
                          title={t('confirmOffline')}
                          description={t('kickOfflineConfirm', { ip: row.ip })}
                          onConfirm={async () => {
                            await kickOfflineByUserDevice({ id: row.id });
                            toast.success(t('kickOfflineSuccess'));
                          }}
                          cancelText={t('cancel')}
                          confirmText={t('confirm')}
                        />,
                      ];
                    },
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
