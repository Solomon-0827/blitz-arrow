'use client';

import { getNodeTagList } from '@/services/admin/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Textarea } from '@workspace/ui/components/textarea';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { UploadImage } from '@workspace/ui/custom-components/upload-image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: '请输入规则名称' }),
  tags: z.array(z.string()).default([]),
  rules: z.string().default(''),
  icon: z.string().default(''),
  type: z.string().default('default'),
});

interface RuleFormProps<T> {
  onSubmit: (data: T) => Promise<boolean> | boolean;
  initialValues?: T;
  loading?: boolean;
  trigger: string;
  title: string;
}

export default function RuleForm<T extends Record<string, any>>({
  onSubmit,
  initialValues,
  loading,
  trigger,
  title,
}: RuleFormProps<T>) {
  const t = useTranslations('rules');

  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
    } as any,
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [form, initialValues]);

  async function handleSubmit(data: { [x: string]: any }) {
    const bool = await onSubmit(data as T);
    if (bool) setOpen(false);
  }

  const { data: tags } = useQuery({
    queryKey: ['getNodeTagList'],
    queryFn: async () => {
      const { data } = await getNodeTagList();
      return data.data?.tags || [];
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            form.reset();
            setOpen(true);
          }}
        >
          {trigger}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[500px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100vh-48px-36px-36px-env(safe-area-inset-top))]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4 px-6 pt-4'>
              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appIcon')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        placeholder={t('enterIconUrl')}
                        value={field.value}
                        suffix={
                          <UploadImage
                            className='bg-muted h-9 rounded-none border-none px-2'
                            onChange={(value) => {
                              form.setValue(field.name, value as string);
                            }}
                          />
                        }
                        onValueChange={(value) => {
                          form.setValue(field.name, value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        placeholder={t('enterRuleName')}
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue(field.name, value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue(field.name, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='default'>{t('default')}</SelectItem>
                          <SelectItem value='reject'>{t('reject')}</SelectItem>
                          <SelectItem value='direct'>{t('direct')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tagsLabel')}</FormLabel>
                    <FormControl>
                      <Combobox<string, true>
                        multiple
                        placeholder={t('selectTags')}
                        value={field.value}
                        onChange={(value) => {
                          form.setValue(field.name, value);
                        }}
                        options={tags?.map((item: string) => ({
                          value: item,
                          label: item,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='rules'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rulesLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('enterRules')}
                        value={field.value}
                        rows={10}
                        onChange={(e) => {
                          form.setValue(field.name, e.target.value);
                        }}
                      />
                    </FormControl>
                    <div className='text-muted-foreground mt-1 text-xs'>
                      <pre>{t('rulesFormat')}</pre>
                      <div className='border-muted mt-2 space-y-1 border-l-2 pl-2'>
                        <p className='font-mono'>DOMAIN,example.com</p>
                        <p className='font-mono'>DOMAIN-SUFFIX,google.com,DIRECT</p>
                        <p className='font-mono'>DOMAIN-KEYWORD,amazon,REJECT</p>
                        <p className='font-mono'>IP-CIDR,192.168.0.0/16</p>
                        <p className='font-mono'>IP-CIDR6,2001:db8::/32,REJECT</p>
                        <p className='font-mono'>SRC-IP-CIDR,192.168.1.201/32</p>
                        <p className='font-mono'>GEOIP,CN,DIRECT</p>
                        <p className='font-mono'>GEOIP,US</p>
                        <p className='font-mono'>DST-PORT,80,DIRECT</p>
                        <p className='font-mono'>SRC-PORT,7777,REJECT</p>
                        <p className='font-mono'>PROCESS-NAME,telegram</p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button
            variant='outline'
            disabled={loading}
            onClick={() => {
              setOpen(false);
            }}
          >
            {t('cancel')}
          </Button>
          <Button disabled={loading} onClick={form.handleSubmit(handleSubmit)}>
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
            {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
