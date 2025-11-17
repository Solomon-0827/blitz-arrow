import { ProTable, ProTableActions } from '@/components/pro-table';
import { getMessageLogList } from '@/services/admin/log';
import { Badge } from '@workspace/ui/components/badge';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

export function LogsTable({ type }: { type: 'email' | 'mobile' }) {
  const t = useTranslations('auth-control.log');
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<
      API.MessageLog,
      {
        platform?: string;
        to?: string;
        subject?: string;
        content?: string;
        status?: number;
      }
    >
      action={ref}
      header={{
        title: t(`${type}Log`),
      }}
      columns={[
        {
          accessorKey: 'id',
          header: 'ID',
        },
        {
          accessorKey: 'platform',
          header: t('platform'),
        },
        {
          accessorKey: 'to',
          header: t('to'),
        },
        {
          accessorKey: 'subject',
          header: t('subject'),
        },
        {
          accessorKey: 'content',
          header: t('content'),
        },
        {
          accessorKey: 'status',
          header: t('status'),
          cell: ({ row }) => {
            const status = row.getValue('status');
            const text = status === 1 ? t('sendSuccess') : t('sendFailed');
            return <Badge variant={status === 1 ? 'default' : 'destructive'}>{text}</Badge>;
          },
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
        {
          accessorKey: 'updated_at',
          header: t('updatedAt'),
          cell: ({ row }) => formatDate(row.getValue('updated_at')),
        },
      ]}
      params={[
        {
          key: 'to',
          placeholder: t('to'),
        },
        {
          key: 'subject',
          placeholder: t('subject'),
        },
        {
          key: 'content',
          placeholder: t('content'),
        },
        {
          key: 'status',
          placeholder: t('status'),
          options: [
            { label: t('sendSuccess'), value: '1' },
            { label: t('sendFailed'), value: '0' },
          ],
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getMessageLogList({
          ...pagination,
          ...filter,
          status: filter.status === undefined ? undefined : Number(filter.status),
          type: type,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}
