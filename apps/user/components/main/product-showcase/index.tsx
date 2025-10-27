import { getSubscription } from '@/services/user/portal';
import { Content } from './content';

export async function ProductShowcase() {
  try {
    const { data } = await getSubscription({
      skipErrorHandler: true,
    });
    const subscriptionList = data.data?.list || [];

    if (subscriptionList.length === 0) return null;

    return <Content subscriptionData={subscriptionList} />;
  } catch (error) {
    return null;
  }
}
