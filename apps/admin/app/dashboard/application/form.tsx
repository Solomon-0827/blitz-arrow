'use client';

import { getSubscribeType } from '@/services/admin/system';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ArrayInput } from '@workspace/ui/custom-components/dynamic-Inputs';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { UploadImage } from '@workspace/ui/custom-components/upload-image';
import { useTranslations } from 'next-intl';
import { assign, shake } from 'radash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const platforms = ['windows', 'macos', 'linux', 'android', 'ios', 'harmony'];

const defaultValues = {
  subscribe_type: 'Clash',
  name: '',
  icon: '',
  url: '',
};

const versionSchema = z.object({
  url: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  is_default: z.boolean().optional(),
});

const formSchema = z.object({
  icon: z.string(),
  name: z.string(),
  subscribe_type: z.string(),
  platform: z.object({
    windows: z.array(versionSchema).optional(),
    macos: z.array(versionSchema).optional(),
    linux: z.array(versionSchema).optional(),
    android: z.array(versionSchema).optional(),
    ios: z.array(versionSchema).optional(),
    harmony: z.array(versionSchema).optional(),
  }),
});

interface FormProps<T> {
  trigger: React.ReactNode | string;
  title: string;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<boolean>;
  loading?: boolean;
}

export default function SubscribeAppForm<
  T extends API.CreateApplicationRequest | API.UpdateApplicationRequest,
>({ trigger, title, loading, initialValues, onSubmit }: FormProps<T>) {
  const t = useTranslations('subscribe.app');
  const [open, setOpen] = useState(false);

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: assign(
      defaultValues,
      shake(initialValues, (value) => value === null),
    ),
  });

  useEffect(() => {
    form.reset(
      assign(
        defaultValues,
        shake(initialValues, (value) => value === null),
      ),
    );
  }, [form, initialValues]);

  const { data: subscribe_types } = useQuery<string[]>({
    queryKey: ['getSubscribeType'],
    queryFn: async () => {
      const { data } = await getSubscribeType();
      return data.data?.subscribe_types || [];
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {typeof trigger === 'string' ? <Button>{trigger}</Button> : trigger}
      </SheetTrigger>
      <SheetContent className='w-[520px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100dvh-48px-36px-36px)]'>
          <Form {...form}>
            <form className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem className='col-span-2'>
                      <FormLabel>{t('appIcon')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          required
                          suffix={
                            <UploadImage
                              className='bg-muted h-9 rounded-none border-none px-2'
                              onChange={(value) => {
                                form.setValue(field.name, value as string);
                              }}
                            />
                          }
                          value={field.value}
                          onValueChange={(value) => {
                            form.setValue(field.name, value as string);
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
                      <FormLabel>{t('appName')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          required
                          type='text'
                          value={field.value}
                          onValueChange={(value) => {
                            form.setValue(field.name, value as string);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='subscribe_type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subscriptionProtocol')}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('subscriptionProtocol')} />
                          </SelectTrigger>
                          <SelectContent>
                            {subscribe_types?.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormItem>
                <FormLabel>{t('platform')}</FormLabel>
                <Tabs defaultValue={platforms[0]}>
                  <TabsList>
                    {platforms.map((platform) => (
                      <TabsTrigger key={platform} value={platform} className='uppercase'>
                        {platform}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {platforms.map((platform) => (
                    <TabsContent key={platform} value={platform}>
                      <FormField
                        control={form.control}
                        name={`platform.${platform as keyof FormSchema['platform']}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ArrayInput
                                isReverse
                                className='grid grid-cols-3 gap-4'
                                fields={[
                                  {
                                    name: 'version',
                                    type: 'text',
                                    placeholder: t('version'),
                                    defaultValue: '1.0.0',
                                  },
                                  {
                                    name: 'description',
                                    type: 'text',
                                    placeholder: t('description'),
                                  },
                                  {
                                    name: 'is_default',
                                    type: 'boolean',
                                    placeholder: t('defaultVersion'),
                                  },
                                  {
                                    name: 'url',
                                    type: 'text',
                                    placeholder: t('downloadLink'),
                                    className: 'col-span-3',
                                  },
                                ]}
                                value={field.value}
                                onChange={(value) => {
                                  const filteredValue = value.filter((item) => item.url);

                                  const newDefaultIndex = value.findIndex(
                                    (item, idx) =>
                                      item.is_default &&
                                      (!field.value?.[idx] || !field.value[idx].is_default),
                                  );

                                  let finalValue = filteredValue;

                                  if (newDefaultIndex >= 0 && filteredValue[newDefaultIndex]) {
                                    finalValue = filteredValue.map((item, index) => ({
                                      ...item,
                                      is_default: index === newDefaultIndex,
                                    }));
                                  } else if (
                                    !filteredValue.some((item) => item.is_default) &&
                                    filteredValue.length > 0
                                  ) {
                                    finalValue = filteredValue.map((item, index) => ({
                                      ...item,
                                      is_default: index === 0,
                                    }));
                                  }

                                  form.setValue(field.name, finalValue as any);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </FormItem>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={form.handleSubmit(async (values) => {
              const success = await onSubmit(values as unknown as T);
              if (success) setOpen(false);
            })}
            disabled={loading}
          >
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
            {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
