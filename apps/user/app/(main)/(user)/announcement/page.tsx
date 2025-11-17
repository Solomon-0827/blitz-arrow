'use client';

import { Empty } from '@/components/empty';
import { queryAnnouncement } from '@/services/user/announcement';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Markdown } from '@workspace/ui/custom-components/markdown';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Page() {
  const t = useTranslations('announcement');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<API.Announcement | null>(null);

  const { data } = useQuery({
    queryKey: ['queryAnnouncement'],
    queryFn: async () => {
      const { data } = await queryAnnouncement({
        page: 1,
        size: 99,
        pinned: false,
        popup: false,
      });
      return data.data?.announcements || [];
    },
  });
  
  return data && data.length > 0 ? (
    <>
      <div className='flex flex-col gap-6'>
        {data.map((item) => (
          <Card 
            key={item.id} 
            className='cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md'
            onClick={() => setSelectedAnnouncement(item)}
          >
            <CardHeader className='space-y-3'>
              <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                <CardTitle className='text-primary text-2xl'>{item.title}</CardTitle>
                <CardDescription className='text-sm md:text-right'>
                  {formatDate(item.created_at)}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='text-primary'>{selectedAnnouncement?.title}</DialogTitle>
            <CardDescription>{selectedAnnouncement?.created_at && formatDate(selectedAnnouncement.created_at)}</CardDescription>
          </DialogHeader>
          <div className='mt-4'>
            {selectedAnnouncement?.content && <Markdown>{selectedAnnouncement.content}</Markdown>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <Empty />
  );
}
