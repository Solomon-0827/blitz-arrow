'use client';

import { Display } from '@/components/display';
import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createUserSubscribe,
  deleteUserSubscribe,
  getUserSubscribe,
  updateUserSubscribe,
} from '@/services/admin/user';
import { Button } from '@workspace/ui/components/button';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { SubscriptionDetail } from './subscription-detail';
import { SubscriptionForm } from './subscription-form';

export default function UserSubscription({ userId }: { userId: number }) {
  const t = useTranslations('user');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.UserSubscribe, Record<string, unknown>>
      action={ref}
      header={{
        title: t('subscriptionList'),
        toolbar: (
          <SubscriptionForm
            key='create'
            trigger={t('add')}
            title={t('createSubscription')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              await createUserSubscribe({
                user_id: Number(userId),
                ...values,
              });
              toast.success(t('createSuccess'));
              ref.current?.refresh();
              setLoading(false);
              return true;
            }}
          />
        ),
      }}
      columns={[
        {
          accessorKey: 'id',
          header: 'ID',
        },
        {
          accessorKey: 'name',
          header: t('subscriptionName'),
          cell: ({ row }) => row.original.subscribe.name,
        },
        {
          accessorKey: 'upload',
          header: t('upload'),
          cell: ({ row }) => <Display type='traffic' value={row.getValue('upload')} />,
        },
        {
          accessorKey: 'download',
          header: t('download'),
          cell: ({ row }) => <Display type='traffic' value={row.getValue('download')} />,
        },
        {
          accessorKey: 'traffic',
          header: t('totalTraffic'),
          cell: ({ row }) => <Display type='traffic' value={row.getValue('traffic')} unlimited />,
        },
        {
          accessorKey: 'speed_limit',
          header: t('speedLimit'),
          cell: ({ row }) => {
            const speed = row.original?.subscribe?.speed_limit;
            return <Display type='trafficSpeed' value={speed} />;
          },
        },
        {
          accessorKey: 'device_limit',
          header: t('deviceLimit'),
          cell: ({ row }) => {
            const limit = row.original?.subscribe?.device_limit;
            return <Display type='number' value={limit} unlimited />;
          },
        },
        {
          accessorKey: 'reset_time',
          header: t('resetTime'),
          cell: ({ row }) => {
            return <Display type='number' value={row.getValue('reset_time')} unlimited />;
          },
        },
        {
          accessorKey: 'expire_time',
          header: t('expireTime'),
          cell: ({ row }) =>
            row.getValue('expire_time') ? formatDate(row.getValue('expire_time')) : t('permanent'),
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      request={async (pagination) => {
        const { data } = await getUserSubscribe({
          user_id: userId,
          ...pagination,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
      actions={{
        render: (row) => {
          return [
            <SubscriptionForm
              key='edit'
              trigger={t('edit')}
              title={t('editSubscription')}
              loading={loading}
              initialData={row}
              onSubmit={async (values) => {
                setLoading(true);
                await updateUserSubscribe({
                  user_id: Number(userId),
                  user_subscribe_id: row.id,
                  ...values,
                });
                toast.success(t('updateSuccess'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              }}
            />,
            <SubscriptionDetail
              key='detail'
              trigger={<Button variant='secondary'>{t('detail')}</Button>}
              userId={userId}
              subscriptionId={row.id}
            />,
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDelete')}
              description={t('deleteSubscriptionDescription')}
              onConfirm={async () => {
                await deleteUserSubscribe({ user_subscribe_id: row.id });
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
