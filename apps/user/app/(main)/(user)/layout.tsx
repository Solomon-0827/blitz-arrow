import Announcement from '@/components/announcement';
import { cookies } from 'next/headers';
import { SidebarLeft } from './sidebar-left';
import { SidebarRight } from './sidebar-right';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-muted/40 relative min-h-screen w-full'>
      <SidebarLeft className='fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-80 lg:flex' />
      <main className='ml-0 mr-0 p-6 lg:ml-80 2xl:mr-80'>{children}</main>
      <SidebarRight className='fixed right-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-80 2xl:flex' />
      <Announcement type='popup' Authorization={(await cookies()).get('Authorization')?.value} />
    </div>
  );
}
