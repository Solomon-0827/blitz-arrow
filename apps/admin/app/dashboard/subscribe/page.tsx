import { getTranslations } from 'next-intl/server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

import GroupTable from './group/table';
import SubscribeConfig from './subscribe-config';
import SubscribeTable from './subscribe-table';

export default async function Page() {
  const t = await getTranslations('subscribe');

  return (
    <Tabs defaultValue='subscribe'>
      <TabsList>
        <TabsTrigger value='subscribe'>{t('tabs.subscribe')}</TabsTrigger>
        <TabsTrigger value='group'>{t('tabs.subscribeGroup')}</TabsTrigger>
        <TabsTrigger value='config'>{t('tabs.subscribeConfig')}</TabsTrigger>
      </TabsList>
      <TabsContent value='subscribe'>
        <SubscribeTable />
      </TabsContent>
      <TabsContent value='group'>
        <GroupTable />
      </TabsContent>
      <TabsContent value='config'>
        <SubscribeConfig />
      </TabsContent>
    </Tabs>
  );
}
