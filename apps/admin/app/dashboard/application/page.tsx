'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createApplication,
  deleteApplication,
  getApplication,
  updateApplication,
} from '@/services/admin/system';
import { Button } from '@workspace/ui/components/button';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ConfigForm from './config';
import SubscribeAppForm from './form';

export default function SubscribeApp() {
  const t = useTranslations('subscribe.app');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.ApplicationResponseInfo, Record<string, unknown>>
      action={ref}
      header={{
        title: t('appList'),
        toolbar: (
          <div className='flex items-center gap-2'>
            <ConfigForm />
            <SubscribeAppForm<API.CreateApplicationRequest>
              trigger={t('create')}
              title={t('createApp')}
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  await createApplication(values);
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
          </div>
        ),
      }}
      request={async (_pagination, filters) => {
        const { data } = await getApplication();
        return {
          list: data.data?.applications || [],
          total: 0,
        };
      }}
      columns={[
        {
          accessorKey: 'icon',
          header: t('appIcon'),
          cell: ({ row }) => (
            <Image
              src={row.getValue('icon')}
              alt={row.getValue('name')}
              className='h-8 w-8 rounded-md'
              width={32}
              height={32}
            />
          ),
        },
        {
          accessorKey: 'name',
          header: t('appName'),
        },
        {
          accessorKey: 'subscribe_type',
          header: t('subscriptionProtocol'),
          cell: ({ row }) => row.getValue('subscribe_type'),
        },
      ]}
      actions={{
        render: (row) => [
          <SubscribeAppForm<API.UpdateApplicationRequest>
            key='edit'
            trigger={<Button>{t('edit')}</Button>}
            title={t('editApp')}
            loading={loading}
            initialValues={{
              ...row,
            }}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await updateApplication({
                  ...values,
                  id: row.id,
                });
                toast.success(t('updateSuccess'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              } catch (error) {
                setLoading(false);
                return false;
              }
            }}
          />,
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('delete')}</Button>}
            title={t('confirmDelete')}
            description={t('deleteWarning')}
            onConfirm={async () => {
              await deleteApplication({ id: row.id! });
              toast.success(t('deleteSuccess'));
              ref.current?.refresh();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
        ],
        batchRender: (rows) => [
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('batchDelete')}</Button>}
            title={t('confirmDelete')}
            description={t('deleteWarning')}
            onConfirm={async () => {
              await Promise.all(rows.map((row) => deleteApplication({ id: row.id! })));
              toast.success(t('deleteSuccess'));
              ref.current?.reset();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
        ],
      }}
    />
  );
}
