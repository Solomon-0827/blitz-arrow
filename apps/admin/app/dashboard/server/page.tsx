import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getTranslations } from 'next-intl/server';

import GroupTable from './group-table';
import NodeConfig from './node-config';
import NodeTable from './node-table';

export default async function Page() {
  const t = await getTranslations('server');

  return (
    <Tabs defaultValue='node'>
      <TabsList>
        <TabsTrigger value='node'>{t('tabs.node')}</TabsTrigger>
        <TabsTrigger value='group'>{t('tabs.nodeGroup')}</TabsTrigger>
        <TabsTrigger value='config'>{t('tabs.nodeConfig')}</TabsTrigger>
      </TabsList>
      <TabsContent value='node'>
        <NodeTable />
      </TabsContent>
      <TabsContent value='group'>
        <GroupTable />
      </TabsContent>
      <TabsContent value='config'>
        <NodeConfig />
      </TabsContent>
    </Tabs>
  );
}
