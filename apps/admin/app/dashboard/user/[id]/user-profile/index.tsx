'use client';

import { getUserDetail } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { AuthMethodsForm } from './auth-methods-form';
import { BasicInfoForm } from './basic-info-form';
import { NotifySettingsForm } from './notify-settings-form';

export function UserProfileForm() {
  const { id } = useParams<{ id: string }>();

  const { data: user, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await getUserDetail({
        id: Number(id),
      });
      return data.data;
    },
  });

  if (!user) return null;

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      <div className='md:col-span-2 xl:col-span-1'>
        <BasicInfoForm user={user} refetch={refetch} />
      </div>
      <div>
        <NotifySettingsForm user={user} refetch={refetch} />
      </div>
      <div>
        <AuthMethodsForm user={user} refetch={refetch} />
      </div>
    </div>
  );
}
