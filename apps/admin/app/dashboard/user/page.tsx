'use client';

import { Display } from '@/components/display';
import { ProTable, ProTableActions } from '@/components/pro-table';
import { getSubscribeList } from '@/services/admin/subscribe';
import { createUser, deleteUser, getUserList, updateUserBasicInfo } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UserDetail } from './user-detail';
import UserForm from './user-form';

export default function Page() {
  const t = useTranslations('user');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  const { data: subscribeList } = useQuery({
    queryKey: ['getSubscribeList', 'all'],
    queryFn: async () => {
      const { data } = await getSubscribeList({
        page: 1,
        size: 9999,
      });
      return data.data?.list as API.SubscribeGroup[];
    },
  });

  return (
    <ProTable<API.User, API.GetUserListParams>
      action={ref}
      header={{
        title: t('userList'),
        toolbar: (
          <UserForm<API.CreateUserRequest>
            key='create'
            trigger={t('create')}
            title={t('createUser')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await createUser(values);
                toast.success(t('createSuccess'));
                ref.current?.refresh();
                setLoading(false);

                return true;
              } catch (error) {
                setLoading(false);

                return false;
              }
            }}
          />
        ),
      }}
      columns={[
        {
          accessorKey: 'enable',
          header: t('enable'),
          cell: ({ row }) => {
            return (
              <Switch
                defaultChecked={row.getValue('enable')}
                onCheckedChange={async (checked) => {
                  const {
                    auth_methods,
                    user_devices,
                    enable_balance_notify,
                    enable_login_notify,
                    enable_subscribe_notify,
                    enable_trade_notify,
                    updated_at,
                    created_at,
                    id,
                    ...rest
                  } = row.original;
                  await updateUserBasicInfo({
                    user_id: id,
                    ...rest,
                    enable: checked,
                  } as unknown as API.UpdateUserBasiceInfoRequest);
                  toast.success(t('updateSuccess'));
                  ref.current?.refresh();
                }}
              />
            );
          },
        },
        {
          accessorKey: 'id',
          header: 'ID',
        },
        {
          accessorKey: 'auth_methods',
          header: t('userName'),
          cell: ({ row }) => {
            const method = row.original.auth_methods?.[0];
            return (
              <div>
                <Badge className='mr-1 uppercase' title={method?.verified ? t('verified') : ''}>
                  {method?.auth_type}
                </Badge>
                {method?.auth_identifier}
              </div>
            );
          },
        },
        {
          accessorKey: 'balance',
          header: t('balance'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('balance')} />,
        },
        {
          accessorKey: 'gift_amount',
          header: t('giftAmount'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('gift_amount')} />,
        },
        {
          accessorKey: 'commission',
          header: t('commission'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('commission')} />,
        },
        {
          accessorKey: 'refer_code',
          header: t('inviteCode'),
          cell: ({ row }) => row.getValue('refer_code') || '--',
        },
        {
          accessorKey: 'referer_id',
          header: t('referer'),
          cell: ({ row }) => <UserDetail id={row.original.referer_id} />,
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getUserList({
          ...pagination,
          ...filter,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
      params={[
        {
          key: 'subscribe_id',
          placeholder: t('subscription'),
          options: subscribeList?.map((item) => ({
            label: item.name,
            value: String(item.id),
          })),
        },
        {
          key: 'search',
          placeholder: 'Search',
        },
        {
          key: 'user_id',
          placeholder: t('userId'),
        },
        {
          key: 'user_subscribe_id',
          placeholder: t('subscriptionId'),
        },
      ]}
      actions={{
        render: (row) => {
          return [
            <Button key='detail' asChild>
              <Link href={`/dashboard/user/${row.id}`}>{t('edit')}</Link>
            </Button>,
            <ConfirmButton
              key='edit'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDelete')}
              description={t('deleteDescription')}
              onConfirm={async () => {
                await deleteUser({ id: row.id });
                toast.success(t('deleteSuccess'));
                ref.current?.refresh();
              }}
              cancelText={t('cancel')}
              confirmText={t('confirm')}
            />,
          ];
        },
      }}
    />
  );
}
