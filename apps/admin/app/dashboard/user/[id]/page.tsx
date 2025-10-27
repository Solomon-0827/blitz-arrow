import UserOrderList from '@/app/dashboard/order/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getTranslations } from 'next-intl/server';
import UserLoginHistory from './user-login-history';
import { UserProfileForm } from './user-profile';
import UserSubscription from './user-subscription';

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
  const t = await getTranslations('user');
  const { id } = await params;
  return (
    <Tabs defaultValue='profile'>
      <TabsList>
        <TabsTrigger value='profile'>{t('userProfile')}</TabsTrigger>
        <TabsTrigger value='subscriptions'>{t('userSubscriptions')}</TabsTrigger>
        <TabsTrigger value='orders'>{t('userOrders')}</TabsTrigger>
        <TabsTrigger value='logs'>{t('userLogs')}</TabsTrigger>
      </TabsList>
      <TabsContent value='profile'>
        <UserProfileForm />
      </TabsContent>
      <TabsContent value='subscriptions'>
        <UserSubscription userId={id} />
      </TabsContent>
      <TabsContent value='orders'>
        <UserOrderList userId={id} />
      </TabsContent>
      <TabsContent value='logs'>
        <UserLoginHistory />
      </TabsContent>
    </Tabs>
  );
}
