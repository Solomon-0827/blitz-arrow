'use client';

import { IpLink } from '@/components/ip-link';
import { ProTable } from '@/components/pro-table';
import { getUserLoginLogs } from '@/services/admin/user';
import { Badge } from '@workspace/ui/components/badge';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function UserLoginHistory() {
  const t = useTranslations('user');
  const { id } = useParams<{ id: string }>();

  return (
    <ProTable<API.UserLoginLog, Record<string, unknown>>
      columns={[
        {
          accessorKey: 'success',
          header: t('loginStatus'),
          cell: ({ row }) => (
            <Badge variant={row.getValue('success') ? 'default' : 'destructive'}>
              {row.getValue('success') ? t('success') : t('failed')}
            </Badge>
          ),
        },
        {
          accessorKey: 'login_ip',
          header: t('loginIp'),
          cell: ({ row }) => <IpLink ip={row.getValue('login_ip')} />,
        },
        {
          accessorKey: 'user_agent',
          header: t('userAgent'),
        },
        {
          accessorKey: 'created_at',
          header: t('loginTime'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getUserLoginLogs({
          user_id: Number(id),
          ...pagination,
          ...filter,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}
