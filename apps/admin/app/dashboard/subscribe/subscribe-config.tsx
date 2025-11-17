'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getSubscribeConfig, updateSubscribeConfig } from '@/services/admin/system';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { Textarea } from '@workspace/ui/components/textarea';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';

export default function SubscribeConfig() {
  const t = useTranslations('subscribe.config');

  const { data, refetch } = useQuery({
    queryKey: ['getSubscribeConfig'],
    queryFn: async () => {
      const { data } = await getSubscribeConfig();

      return data.data;
    },
  });

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateSubscribeConfig({
        ...data,
        [key]: value,
      } as API.SubscribeConfig);
      toast.success(t('updateSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>
            <Label>{t('singleSubscriptionMode')}</Label>
            <p className='text-muted-foreground text-xs'>
              {t('singleSubscriptionModeDescription')}
            </p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.single_model}
              onCheckedChange={(checked) => {
                updateConfig('single_model', checked);
              }}
            />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>
            <Label>{t('wildcardResolution')}</Label>
            <p className='text-muted-foreground text-xs'>{t('wildcardResolutionDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.pan_domain}
              onCheckedChange={(checked) => {
                updateConfig('pan_domain', checked);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('subscriptionPath')}</Label>
            <p className='text-muted-foreground text-xs'>{t('subscriptionPathDescription')}</p>
          </TableCell>
          <TableCell className='flex items-center gap-2 text-right'>
            <EnhancedInput
              placeholder={t('subscriptionPathPlaceholder')}
              value={data?.subscribe_path}
              onValueBlur={(value) => updateConfig('subscribe_path', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='align-top'>
            <Label>{t('subscriptionDomain')}</Label>
            <p className='text-muted-foreground text-xs'>{t('subscriptionDomainDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Textarea
              className='h-52'
              placeholder={`${t('subscriptionDomainPlaceholder')}\nexample.com\nwww.example.com`}
              defaultValue={data?.subscribe_domain}
              onBlur={(e) => {
                updateConfig('subscribe_domain', e.target.value);
              }}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
