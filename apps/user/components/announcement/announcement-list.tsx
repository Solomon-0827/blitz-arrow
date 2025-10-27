'use client';

import { queryAnnouncement } from '@/services/user/announcement';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Icon } from '@workspace/ui/custom-components/icon';
import { Markdown } from '@workspace/ui/custom-components/markdown';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export default function AnnouncementList() {
  const t = useTranslations('dashboard');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<API.Announcement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['queryAnnouncement'],
    queryFn: async () => {
      const { data } = await queryAnnouncement({
        page: 1,
        size: 6,
        pinned: false,
        popup: false,
      });
      return data.data?.announcements || [];
    },
  });

  // Always render the section, even if no data
  return (
    <>
      {/* Quick Actions Row - Above Announcements */}
      <div className='grid gap-4 md:grid-cols-3 mb-6'>
        <Card className='group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md' onClick={() => window.location.href = '/subscribe'}>
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <div className='rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors'>
              <Icon icon='uil:credit-card' className='size-6 text-primary' />
            </div>
            <h3 className='font-semibold mb-1'>{t('purchaseSubscription')}</h3>
            <p className='text-sm text-muted-foreground'>{t('purchaseSubscriptionDesc')}</p>
          </CardContent>
        </Card>

        <Card className='group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md' onClick={() => window.location.href = '/document'}>
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <div className='rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors'>
              <Icon icon='uil:book-open' className='size-6 text-primary' />
            </div>
            <h3 className='font-semibold mb-1'>{t('documentation')}</h3>
            <p className='text-sm text-muted-foreground'>{t('documentationDesc')}</p>
          </CardContent>
        </Card>

        <Card className='group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md' onClick={() => window.location.href = '/ticket'}>
          <CardContent className='flex flex-col items-center justify-center p-6 text-center'>
            <div className='rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors'>
              <Icon icon='uil:headphones' className='size-6 text-primary' />
            </div>
            <h3 className='font-semibold mb-1'>{t('support')}</h3>
            <p className='text-sm text-muted-foreground'>{t('supportDesc')}</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center justify-between'>
        <h2 className='flex items-center gap-1.5 font-semibold'>
          <Icon icon='uil:bell' className='size-5' />
          {t('announcements')}
        </h2>
        <Link href='/announcement' className='text-primary text-sm hover:underline'>
          {t('viewAll')}
        </Link>
      </div>

      {isLoading && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader>
                <div className='h-4 bg-muted rounded w-3/4'></div>
                <div className='h-3 bg-muted rounded w-1/2 mt-2'></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className='p-6 text-center text-muted-foreground'>
          <Icon icon='uil:exclamation-triangle' className='size-8 mx-auto mb-2' />
          <p>Failed to load announcements</p>
        </Card>
      )}

      {data && data.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {data.slice(0, 6).map((item) => (
            <Card
              key={item.id}
              className='cursor-pointer transition-all hover:border-primary/50 hover:shadow-md'
              onClick={() => setSelectedAnnouncement(item)}
            >
              <CardHeader className='space-y-3'>
                <CardTitle className='line-clamp-2 text-primary'>{item.title}</CardTitle>
                <CardDescription className='text-sm'>{formatDate(item.created_at)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <Card className='p-8 text-center text-muted-foreground'>
          <Icon icon='uil:bell-slash' className='size-12 mx-auto mb-4 opacity-50' />
          <p>No announcements available</p>
        </Card>
      )}

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl'>
          <DialogHeader className='space-y-4 pb-4'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2'>
                <DialogTitle className='text-2xl font-bold text-primary leading-tight'>
                  {selectedAnnouncement?.title}
                </DialogTitle>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Icon icon='uil:calendar-alt' className='size-4' />
                  <span>{selectedAnnouncement?.created_at && formatDate(selectedAnnouncement.created_at)}</span>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedAnnouncement(null)}
                className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
              >
                <Icon icon='uil:times' className='size-4' />
              </Button>
            </div>
            <div className='h-px bg-gradient-to-r from-border via-border/50 to-transparent' />
          </DialogHeader>

          <div className='flex-1 overflow-y-auto px-1'>
            <div className='prose prose-sm max-w-none dark:prose-invert'>
              {selectedAnnouncement?.content && (
                <Markdown className='text-foreground/90 leading-relaxed'>
                  {selectedAnnouncement.content}
                </Markdown>
              )}
            </div>
          </div>

          <div className='flex items-center justify-between pt-4 border-t border-border/50'>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Icon icon='uil:clock' className='size-3' />
              <span>Read time: ~2 min</span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setSelectedAnnouncement(null)}
              className='rounded-full'
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}