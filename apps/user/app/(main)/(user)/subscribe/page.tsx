'use client';

import { Display } from '@/components/display';
import { querySubscribeGroupList, querySubscribeList } from '@/services/user/subscribe';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Empty } from '@/components/empty';
import { SubscribeDetail } from '@/components/subscribe/detail';
import Purchase from '@/components/subscribe/purchase';

export default function Page() {
  const t = useTranslations('subscribe');
  const [subscribe, setSubscribe] = useState<API.Subscribe>();

  const [group, setGroup] = useState<string>('');

  const { data: groups } = useQuery({
    queryKey: ['querySubscribeGroupList'],
    queryFn: async () => {
      const { data } = await querySubscribeGroupList();
      return data.data?.list || [];
    },
  });

  const { data } = useQuery({
    queryKey: ['querySubscribeList'],
    queryFn: async () => {
      const { data } = await querySubscribeList();
      return data.data?.list || [];
    },
  });

  return (
    <>
      <Tabs value={group} onValueChange={setGroup} className='space-y-4'>
        {groups && groups.length > 0 && (
          <>
            <h1 className='text-muted-foreground w-full'>{t('category')}</h1>
            <TabsList>
              <TabsTrigger value=''>{t('all')}</TabsTrigger>
              {groups.map((group) => (
                <TabsTrigger key={group.id} value={String(group.id)}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <h2 className='text-muted-foreground w-full'>{t('products')}</h2>
          </>
        )}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {data
            ?.filter((item) => item.show)
            ?.filter((item) => (group ? item.group_id === Number(group) : true))
            ?.map((item) => (
              <Card
                className='group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-lg'
                key={item.id}
              >
                <CardHeader className='bg-gradient-to-r from-primary/5 to-primary/10 pb-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-semibold text-primary'>{item.name}</h3>
                    <div className='rounded-full bg-primary/10 px-3 py-1'>
                      <span className='text-sm font-medium text-primary'>
                        <Display type='currency' value={item.unit_price} />
                        <span className='text-xs'>/{t(item.unit_time || 'Month')}</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='flex flex-grow flex-col gap-4 p-6'>
                  <ul className='flex flex-grow flex-col gap-3'>
                    {(() => {
                      let parsedDescription;
                      try {
                        parsedDescription = JSON.parse(item.description);
                      } catch {
                        parsedDescription = { description: '', features: [] };
                      }

                      const { description, features } = parsedDescription;
                      return (
                        <>
                          {description && (
                            <li className='text-sm text-muted-foreground leading-relaxed'>
                              {description}
                            </li>
                          )}
                          {features?.map(
                            (
                              feature: {
                                icon: string;
                                label: string;
                                type: 'default' | 'success' | 'destructive';
                              },
                              index: number,
                            ) => (
                              <li
                                className={cn('flex items-center gap-3 text-sm', {
                                  'text-muted-foreground line-through opacity-60':
                                    feature.type === 'destructive',
                                })}
                                key={index}
                              >
                                {feature.icon && (
                                  <div className={cn('rounded-full p-1', {
                                    'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400':
                                      feature.type === 'success',
                                    'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400':
                                      feature.type === 'destructive',
                                    'bg-primary/10 text-primary': feature.type === 'default',
                                  })}>
                                    <Icon
                                      icon={feature.icon}
                                      className='size-4'
                                    />
                                  </div>
                                )}
                                <span className={cn({
                                  'text-green-600 dark:text-green-400': feature.type === 'success',
                                  'text-destructive': feature.type === 'destructive',
                                })}>
                                  {feature.label}
                                </span>
                              </li>
                            ),
                          )}
                        </>
                      );
                    })()}
                  </ul>

                  <SubscribeDetail
                    subscribe={{
                      ...item,
                      name: undefined,
                    }}
                  />
                </CardContent>

                <div className='border-t border-border/50 p-4'>
                  <Button
                    className='w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg'
                    size='lg'
                    onClick={() => {
                      setSubscribe(item);
                    }}
                  >
                    <Icon icon='uil:shopping-cart' className='mr-2 size-5' />
                    {t('buy')}
                  </Button>
                </div>
              </Card>
            ))}
        </div>
        {data?.length === 0 && <Empty />}
      </Tabs>
      <Purchase subscribe={subscribe} setSubscribe={setSubscribe} />
    </>
  );
}
