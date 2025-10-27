import { getSubscription } from '@/services/user/portal';
import Content from './content';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    id: string;
  }>;
}) {
  const { id } = await searchParams;
  const { data } = await getSubscription({
    skipErrorHandler: true,
  });
  const subscriptionList = data.data?.list || [];
  const subscription = subscriptionList.find((item) => item.id === Number(id));

  return (
    <main className='container space-y-16'>
      <Content subscription={subscription} />
    </main>
  );
}
