'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createRuleGroup,
  deleteRuleGroup,
  getRuleGroupList,
  updateRuleGroup,
} from '@/services/admin/server';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ImportYamlRules from './import-yaml-rules';
import RuleForm from './rule-form';

export default function Page() {
  const t = useTranslations('rules');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.ServerRuleGroup, { query: string }>
      action={ref}
      header={{
        toolbar: (
          <div className='flex gap-2'>
            <Button variant='default' asChild>
              <Link href='/template/rules.yml' target='_blank' download>
                {t('downloadTemplate')}
              </Link>
            </Button>
            <ImportYamlRules onImportSuccess={() => ref.current?.refresh()} />
            <RuleForm<API.CreateRuleGroupRequest>
              trigger={t('create')}
              title={t('createRule')}
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  await createRuleGroup({
                    name: values.name,
                    rules: values.rules || '',
                    enable: false,
                    tags: values.tags || [],
                    icon: values.icon || '',
                    type: values.type || 'default',
                    default: false,
                  });
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
      params={[
        {
          key: 'search',
          placeholder: t('searchRule'),
        },
      ]}
      request={async (pagination, filters) => {
        const { data } = await getRuleGroupList({
          ...pagination,
          ...filters,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
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
                  await updateRuleGroup({
                    ...row.original,
                    enable: checked,
                  } as API.UpdateRuleGroupRequest);
                  ref.current?.refresh();
                }}
              />
            );
          },
        },
        {
          accessorKey: 'default',
          header: t('defaultRule'),
          cell: ({ row }) => (
            <Switch
              defaultChecked={row.original.default}
              onCheckedChange={async (checked) => {
                await updateRuleGroup({
                  ...row.original,
                  default: checked,
                } as API.UpdateRuleGroupRequest);
                ref.current?.refresh();
              }}
            />
          ),
        },
        {
          accessorKey: 'type',
          header: t('type'),
          cell: ({ row }) => {
            const type = row.original.type || 'default';
            if (type === 'default') {
              return <Badge variant='default'>{t('default')}</Badge>;
            }
            if (type === 'reject') {
              return <Badge variant='destructive'>{t('reject')}</Badge>;
            }
            if (type === 'direct') {
              return <Badge variant='secondary'>{t('direct')}</Badge>;
            }
            return <Badge variant='default'>{t('default')}</Badge>;
          },
        },
        {
          accessorKey: 'name',
          header: t('name'),
          cell: ({ row }) => (
            <div className='flex items-center gap-2'>
              {row.original.icon && (
                <Image
                  src={row.original.icon}
                  alt={row.original.name}
                  className='h-6 w-6 rounded-md'
                  width={24}
                  height={24}
                />
              )}
              <span>{row.original.name}</span>
            </div>
          ),
        },
        {
          accessorKey: 'tags',
          header: t('tags'),
          cell: ({ row }) => {
            const tags = row.original.tags.filter((item) => item) || [];
            if (!tags.length) return '--';
            return (
              <>
                {tags.map((tag) => (
                  <Badge key={tag} variant='outline' className='mr-1'>
                    {tag}
                  </Badge>
                ))}
              </>
            );
          },
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.original.created_at),
        },
      ]}
      actions={{
        render: (row) => [
          <RuleForm<API.UpdateRuleGroupRequest>
            key='edit'
            trigger={t('edit')}
            title={t('editRule')}
            loading={loading}
            initialValues={row}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await updateRuleGroup({
                  id: row.id,
                  name: values.name,
                  tags: values.tags,
                  rules: values.rules,
                  enable: row.enable,
                  icon: values.icon,
                  type: values.type,
                  default: row.default,
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
              await deleteRuleGroup({ id: row.id });
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
            trigger={<Button variant='destructive'>{t('delete')}</Button>}
            title={t('confirmDelete')}
            description={t('deleteWarning')}
            onConfirm={async () => {
              for (const row of rows) {
                await deleteRuleGroup({ id: row.id });
              }
              toast.success(t('deleteSuccess'));
              ref.current?.reset();
              ref.current?.refresh();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
        ],
      }}
    />
  );
}
