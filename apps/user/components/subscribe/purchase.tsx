'use client';

import CouponInput from '@/components/subscribe/coupon-input';
import DurationSelector from '@/components/subscribe/duration-selector';
import PaymentMethods from '@/components/subscribe/payment-methods';
import useGlobalStore from '@/config/use-global';
import { preCreateOrder, purchase } from '@/services/user/order';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import { Display } from '@/components/display';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { SubscribeBilling } from './billing';
import { SubscribeDetail } from './detail';

interface PurchaseProps {
  subscribe?: API.Subscribe;
  setSubscribe: (subscribe?: API.Subscribe) => void;
}

export default function Purchase({ subscribe, setSubscribe }: Readonly<PurchaseProps>) {
  const t = useTranslations('subscribe');
  const { getUserInfo } = useGlobalStore();
  const router = useRouter();
  const [params, setParams] = useState<Partial<API.PurchaseOrderRequest>>({
    quantity: 1,
    subscribe_id: 0,
    payment: -1,
    coupon: '',
  });
  const [loading, startTransition] = useTransition();
  const lastSuccessOrderRef = useRef<any>(null);

  const { data: order, isLoading: orderLoading } = useQuery({
    enabled: !!subscribe?.id,
    queryKey: ['preCreateOrder', params],
    queryFn: async () => {
      try {
        const { data } = await preCreateOrder({
          ...params,
          subscribe_id: subscribe?.id as number,
        } as API.PurchaseOrderRequest);
        const result = data.data;
        if (result) {
          lastSuccessOrderRef.current = result;
        }
        return result;
      } catch (error) {
        if (lastSuccessOrderRef.current) {
          return lastSuccessOrderRef.current;
        }
        throw error;
      }
    },
  });

  useEffect(() => {
    if (subscribe) {
      setParams((prev) => ({
        ...prev,
        quantity: 1,
        subscribe_id: subscribe?.id,
      }));
    }
  }, [subscribe]);

  const handleChange = useCallback((field: keyof typeof params, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    startTransition(async () => {
      try {
        const response = await purchase(params as API.PurchaseOrderRequest);
        const orderNo = response.data.data?.order_no;
        if (orderNo) {
          getUserInfo();
          router.push(`/payment?order_no=${orderNo}`);
        }
      } catch (error) {
        /* empty */
      }
    });
  }, [params, router, getUserInfo]);

  return (
    <Dialog
      open={!!subscribe?.id}
      onOpenChange={(open) => {
        if (!open) setSubscribe(undefined);
      }}
    >
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl'>
        <DialogHeader className='space-y-4 p-6 pb-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <DialogTitle className='text-2xl font-bold text-primary'>
                {t('buySubscription')}
              </DialogTitle>
              <p className='text-sm text-muted-foreground'>
                Complete your purchase for {subscribe?.name}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSubscribe(undefined)}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
            >
              <Icon icon='uil:times' className='size-4' />
            </Button>
          </div>
          <div className='h-px bg-gradient-to-r from-border via-border/50 to-transparent' />
        </DialogHeader>

        <div className='flex-1 overflow-y-auto'>
          <div className='grid gap-6 p-6 lg:grid-cols-2'>
            {/* Product Details */}
            <Card className='border border-border/60 bg-background/60 backdrop-blur-sm'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-primary/10 p-2'>
                      <Icon icon='uil:server' className='size-5 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-lg'>{subscribe?.name}</h3>
                      <p className='text-sm text-muted-foreground'>Subscription Plan</p>
                    </div>
                  </div>

                  <SubscribeDetail
                    subscribe={{
                      ...subscribe,
                      quantity: params.quantity,
                    }}
                  />

                  <div className='pt-4 border-t border-border/50'>
                    <SubscribeBilling
                      order={{
                        ...order,
                        quantity: params.quantity,
                        unit_price: subscribe?.unit_price || 0,
                        amount: order?.amount || order?.total || subscribe?.unit_price || 0,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Options */}
            <div className='space-y-6'>
              <Card className='border border-border/60 bg-background/60 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    <h3 className='font-semibold text-lg flex items-center gap-2'>
                      <Icon icon='uil:setting' className='size-5 text-primary' />
                      Purchase Options
                    </h3>

                    <DurationSelector
                      quantity={params.quantity!}
                      unitTime={subscribe?.unit_time}
                      discounts={subscribe?.discount}
                      onChange={(value) => {
                        handleChange('quantity', value);
                      }}
                    />

                    <CouponInput
                      coupon={params.coupon}
                      onChange={(value) => handleChange('coupon', value)}
                    />

                    <PaymentMethods
                      value={params.payment!}
                      onChange={(value) => {
                        handleChange('payment', value);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Button */}
              <div className='sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t border-border/50'>
                <Button
                  className='w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50'
                  size='lg'
                  disabled={loading || orderLoading || !order}
                  onClick={handleSubmit}
                >
                  {loading || orderLoading ? (
                    <>
                      <LoaderCircle className='mr-2 size-5 animate-spin' />
                      {loading ? 'Processing...' : 'Calculating...'}
                    </>
                  ) : (
                    <>
                      <Icon icon='uil:credit-card' className='mr-2 size-5' />
                      {t('buyNow')} - <Display type='currency' value={order?.amount || order?.total || subscribe?.unit_price || 0} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
