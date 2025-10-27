'use client';

import {
  getApplication,
  getApplicationConfig,
  updateApplicationConfig,
} from '@/services/admin/system';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
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
import { UploadImage } from '@workspace/ui/custom-components/upload-image';
import { DicesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { uid } from 'radash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  app_id: z.number().optional(),
  encryption_key: z.string().optional(),
  encryption_method: z.string().optional(),
  startup_picture: z.string().optional(),
  startup_picture_skip_time: z.number().optional(),
  domains: z.array(z.string()).optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ConfigForm() {
  const t = useTranslations('subscribe.app');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      app_id: 0,
      encryption_key: '',
      encryption_method: '',
      startup_picture: '',
      startup_picture_skip_time: 0,
      domains: [],
    },
  });

  const { data, refetch } = useQuery({
    queryKey: ['getApplicationConfig'],
    queryFn: async () => {
      const { data } = await getApplicationConfig();
      return data.data;
    },
  });

  const { data: applications } = useQuery({
    queryKey: ['getApplication'],
    queryFn: async () => {
      const { data } = await getApplication();
      return data.data?.applications || [];
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(values: FormSchema) {
    setLoading(true);
    try {
      await updateApplicationConfig({
        ...values,
        domains: values.domains?.filter((domain) => domain),
      } as API.ApplicationConfig);
      toast.success(t('updateSuccess'));
      refetch();
      setOpen(false);
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline'>
          <Icon icon='mdi:cog' className='mr-2' />
          {t('config')}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[520px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{t('configApp')}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100dvh-48px-36px-36px)]'>
          <Form {...form}>
            <form className='space-y-4 py-4'>
              <FormField
                control={form.control}
                name='app_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectApp')}</FormLabel>
                    <FormDescription>{t('selectAppDescription')}</FormDescription>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={
                          applications?.map((app) => ({
                            label: app.name,
                            value: app.id,
                          })) || []
                        }
                        value={field.value}
                        onChange={(value) => form.setValue(field.name, value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='encryption_key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('communicationKey')}</FormLabel>
                    <FormDescription>{t('communicationKeyDescription')}</FormDescription>
                    <FormControl>
                      <EnhancedInput
                        value={field.value}
                        onValueChange={(value) => form.setValue(field.name, value as string)}
                        suffix={
                          <div className='bg-muted flex h-9 items-center text-nowrap px-3'>
                            <DicesIcon
                              onClick={() => {
                                const id = uid(32).toLowerCase();
                                const formatted = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
                                form.setValue(field.name, formatted);
                              }}
                              className='cursor-pointer'
                            />
                          </div>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='encryption_method'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('encryption')}</FormLabel>
                    <FormDescription>{t('encryptionDescription')}</FormDescription>
                    <FormControl>
                      <Combobox
                        options={[
                          { label: 'none', value: 'none' },
                          { label: 'AES', value: 'aes' },
                        ]}
                        value={field.value}
                        onChange={(value) => form.setValue(field.name, value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='startup_picture'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('startupPicture')}</FormLabel>
                    <FormDescription>{t('startupPictureDescription')}</FormDescription>
                    <FormControl>
                      <EnhancedInput
                        value={field.value}
                        onValueChange={(value) => form.setValue(field.name, value as string)}
                        suffix={
                          <UploadImage
                            className='bg-muted h-9 rounded-none border-none px-2'
                            onChange={(value) => form.setValue('startup_picture', value as string)}
                          />
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='startup_picture_skip_time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('startupPictureSkip')}</FormLabel>
                    <FormDescription>{t('startupPictureSkipDescription')}</FormDescription>
                    <FormControl>
                      <EnhancedInput
                        {...field}
                        type='number'
                        min={0}
                        suffix='S'
                        value={field.value}
                        onValueChange={(value) =>
                          form.setValue('startup_picture_skip_time', Number(value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='domains'
                render={({ field }) => (
                  <FormItem className='px-1'>
                    <FormLabel>{t('backupDomains')}</FormLabel>
                    <FormDescription>{t('backupDomainsDescription')}</FormDescription>
                    <FormControl>
                      <Textarea
                        className='h-28'
                        placeholder='example.com'
                        value={field.value?.join('\n')}
                        onChange={(e) => {
                          form.setValue(field.name, e.target.value.split('\n'));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
            {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
