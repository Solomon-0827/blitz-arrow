'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { ProTable } from '@/components/pro-table';
import { getUserSubscribeById } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Progress } from '@workspace/ui/components/progress';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { formatBytes, formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface NodeDetailDialogProps {
  node: API.Server;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

// 统一的用户订阅信息组件
function UserSubscribeInfo({
  userId,
  type,
}: {
  userId: number;
  type: 'account' | 'subscribeName' | 'subscribeId' | 'trafficUsage' | 'expireTime';
}) {
  const { data } = useQuery({
    enabled: userId !== 0,
    queryKey: ['getUserSubscribeById', userId],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id: userId });
      return data.data;
    },
  });

  if (!data) return <span className='text-muted-foreground'>--</span>;

  switch (type) {
    case 'account':
      if (!data.user_id) return <span className='text-muted-foreground'>--</span>;
      return <UserDetail id={data.user_id} />;

    case 'subscribeName':
      if (!data.subscribe?.name) return <span className='text-muted-foreground'>--</span>;
      return <span className='text-sm'>{data.subscribe.name}</span>;

    case 'subscribeId':
      if (!data.id) return <span className='text-muted-foreground'>--</span>;
      return <span className='font-mono text-sm'>{data.id}</span>;

    case 'trafficUsage': {
      const usedTraffic = data.upload + data.download;
      const totalTraffic = data.traffic || 0;
      return (
        <div className='min-w-0 text-sm'>
          <div className='break-words'>
            {formatBytes(usedTraffic)} / {totalTraffic > 0 ? formatBytes(totalTraffic) : '无限制'}
          </div>
        </div>
      );
    }

    case 'expireTime': {
      if (!data.expire_time) return <span className='text-muted-foreground'>--</span>;
      const isExpired = data.expire_time < Date.now() / 1000;
      return (
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
          <span className='text-sm'>{formatDate(data.expire_time)}</span>
          {isExpired && (
            <Badge variant='destructive' className='w-fit px-1 py-0 text-xs'>
              过期
            </Badge>
          )}
        </div>
      );
    }

    default:
      return <span className='text-muted-foreground'>--</span>;
  }
}

export function NodeDetailDialog({ node, children, trigger }: NodeDetailDialogProps) {
  const t = useTranslations('server.node');
  const [open, setOpen] = useState(false);

  const { status } = node;
  const { online, cpu, mem, disk, updated_at } = status || {
    online: {},
    cpu: 0,
    mem: 0,
    disk: 0,
    updated_at: 0,
  };

  const isOnline = updated_at > 0;
  const onlineCount = (online && Object.keys(online).length) || 0;

  // 转换在线用户数据为ProTable需要的格式
  const onlineUsersData = Object.entries(online || {}).map(([uid, ips]) => ({
    uid,
    ips: ips as string[],
    primaryIp: ips[0] || '',
    allIps: (ips as string[]).join(', '),
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant='outline' size='sm'>
            {t('detail')}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className='w-full max-w-full sm:w-[600px] sm:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>
            {t('nodeDetail')} - {node.name}
          </SheetTitle>
        </SheetHeader>
        <div className='-mx-6 h-[calc(100dvh-48px-16px-env(safe-area-inset-top))] space-y-2 overflow-y-auto px-6 py-4'>
          <h3 className='text-base font-medium'>{t('nodeStatus')}</h3>
          <div className='space-y-3'>
            <div className='flex w-full flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3'>
              <Badge variant={isOnline ? 'default' : 'destructive'} className='w-fit text-xs'>
                {isOnline ? t('normal') : t('abnormal')}
              </Badge>
              <span className='text-muted-foreground'>
                {t('onlineCount')}: {onlineCount}
              </span>
              {isOnline && (
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  {t('lastUpdated')}: {formatDate(updated_at)}
                </span>
              )}
            </div>

            {isOnline && (
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>CPU</span>
                    <span>{cpu?.toFixed(1)}%</span>
                  </div>
                  <Progress value={cpu ?? 0} className='h-1.5' max={100} />
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>{t('memory')}</span>
                    <span>{mem?.toFixed(1)}%</span>
                  </div>
                  <Progress value={mem ?? 0} className='h-1.5' max={100} />
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>{t('disk')}</span>
                    <span>{disk?.toFixed(1)}%</span>
                  </div>
                  <Progress value={disk ?? 0} className='h-1.5' max={100} />
                </div>
              </div>
            )}
          </div>
          {isOnline && onlineCount > 0 && (
            <div>
              <h3 className='mb-3 text-lg font-medium'>{t('onlineUsers')}</h3>
              <div className='overflow-x-auto'>
                <ProTable
                  header={{
                    hidden: true,
                  }}
                  columns={[
                    {
                      accessorKey: 'allIps',
                      header: t('ipAddresses'),
                      cell: ({ row }) => {
                        const ips = row.original.ips;
                        return (
                          <div className='flex min-w-0 flex-col gap-1'>
                            {ips.map((ip: string, index: number) => (
                              <div key={ip} className='whitespace-nowrap text-sm'>
                                {index === 0 ? (
                                  <span className='font-medium'>{ip}</span>
                                ) : (
                                  <span className='text-muted-foreground'>{ip}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: 'user',
                      header: t('user'),
                      cell: ({ row }) => (
                        <UserSubscribeInfo userId={Number(row.original.uid)} type='account' />
                      ),
                    },
                    {
                      accessorKey: 'subscribeName',
                      header: t('subscribeName'),
                      cell: ({ row }) => (
                        <UserSubscribeInfo userId={Number(row.original.uid)} type='subscribeName' />
                      ),
                    },
                    {
                      accessorKey: 'subscribeId',
                      header: t('subscribeId'),
                      cell: ({ row }) => (
                        <UserSubscribeInfo userId={Number(row.original.uid)} type='subscribeId' />
                      ),
                    },
                    {
                      accessorKey: 'trafficUsage',
                      header: t('trafficUsage'),
                      cell: ({ row }) => (
                        <UserSubscribeInfo userId={Number(row.original.uid)} type='trafficUsage' />
                      ),
                    },
                    {
                      accessorKey: 'expireTime',
                      header: t('expireTime'),
                      cell: ({ row }) => (
                        <UserSubscribeInfo userId={Number(row.original.uid)} type='expireTime' />
                      ),
                    },
                  ]}
                  request={async () => ({
                    list: onlineUsersData,
                    total: onlineUsersData.length,
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
