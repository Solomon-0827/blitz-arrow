'use client';

import { getSystemLog, getVersion, restartSystem } from '@/services/admin/tool';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Icon } from '@workspace/ui/custom-components/icon';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import packageJson from '../../../../../package.json';

const getLogLevelColor = (level: string) => {
  const colorMap: { [key: string]: string } = {
    INFO: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    WARN: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    ERROR: 'bg-red-100 text-red-800 hover:bg-red-200',
  };
  return colorMap[level] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
};

export default function Page() {
  const t = useTranslations('tool');
  const {
    data: logs,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['getSystemLog'],
    queryFn: async () => {
      const { data } = await getSystemLog();
      return data.data?.list || [];
    },
  });

  const [openRestart, setOpenRestart] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const { data: latestReleases } = useQuery({
    queryKey: ['getLatestReleases'],
    queryFn: async () => {
      try {
        const [webResponse, serverResponse] = await Promise.all([
          fetch('https://api.github.com/repos/perfect-panel/ppanel-web/releases/latest'),
          fetch('https://api.github.com/repos/perfect-panel/server/releases/latest'),
        ]);

        const webData = webResponse.ok ? await webResponse.json() : null;
        const serverData = serverResponse.ok ? await serverResponse.json() : null;

        return {
          web: webData
            ? {
                version: webData.tag_name,
                url: webData.html_url,
                publishedAt: webData.published_at,
              }
            : null,
          server: serverData
            ? {
                version: serverData.tag_name,
                url: serverData.html_url,
                publishedAt: serverData.published_at,
              }
            : null,
        };
      } catch (error) {
        console.error('Failed to fetch latest releases:', error);
        return { web: null, server: null };
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
    retryDelay: 10000,
  });

  // 检查是否有新版本
  const hasNewVersion =
    latestReleases?.web && packageJson.version !== latestReleases.web.version.replace(/^v/, '');

  const { data: systemInfo } = useQuery({
    queryKey: ['getVersion'],
    queryFn: async () => {
      const { data } = await getVersion();

      const versionString = data.data?.version || '';
      const releaseVersionRegex = /^[Vv]?\d+\.\d+\.\d+$/;
      const timeMatch = versionString.match(/\(([^)]+)\)/);
      const timeInBrackets = timeMatch ? timeMatch[1] : '';

      const versionWithoutTime = versionString.replace(/\([^)]*\)/, '').trim();
      const isDevelopment = !releaseVersionRegex.test(versionWithoutTime);

      let baseVersion = versionWithoutTime;
      let versionSuffix = '';
      let lastUpdated = '';

      if (isDevelopment && versionWithoutTime.includes('-')) {
        const parts = versionWithoutTime.split('-');
        baseVersion = parts[0] || versionWithoutTime;
        versionSuffix = parts.slice(1).join('-');
      }

      lastUpdated = formatDate(new Date(timeInBrackets || Date.now())) || '';

      const displayVersion =
        baseVersion.startsWith('V') || baseVersion.startsWith('v')
          ? baseVersion
          : `V${baseVersion}`;

      return {
        isRelease: !isDevelopment,
        version: displayVersion,
        lastUpdated,
      };
    },
  });

  const hasServerNewVersion =
    latestReleases?.server &&
    systemInfo &&
    systemInfo.version.replace(/^V/, '') !== latestReleases.server.version.replace(/^v/, '');

  return (
    <Card className='border-none'>
      <CardHeader className='flex flex-col items-start justify-between sm:flex-row sm:items-center'>
        <div>
          <CardTitle>{t('systemServices')}</CardTitle>
          <CardDescription>{t('viewLogsAndManage')}</CardDescription>
        </div>
        <div className='mt-4 flex flex-col space-y-2 sm:mt-0 sm:flex-row sm:space-x-2 sm:space-y-0'>
          {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>{t('systemUpgrade')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmSystemUpgrade')}</AlertDialogTitle>
                <AlertDialogDescription>{t('upgradeDescription')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction>{t('confirmUpgrade')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
          <AlertDialog open={openRestart} onOpenChange={setOpenRestart}>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>{t('systemReboot')}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmSystemReboot')}</AlertDialogTitle>
                <AlertDialogDescription>{t('rebootDescription')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <Button
                  onClick={async () => {
                    setIsRestarting(true);
                    await restartSystem();
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    setIsRestarting(false);
                    setOpenRestart(false);
                  }}
                  disabled={isRestarting}
                >
                  {isRestarting && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}{' '}
                  {isRestarting ? t('rebooting') : t('confirmReboot')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* 版本信息紧凑显示 */}
          <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0'>
            {/* 用户端/管理端版本 */}
            <div className='bg-muted/30 flex flex-1 items-center justify-between rounded-md p-2'>
              <div className='flex items-center'>
                <Icon icon='mdi:web' className='mr-2 h-4 w-4 text-green-600' />
                <div className='flex items-center space-x-2'>
                  <span className='text-xs font-medium'>{t('webVersion')}</span>
                  <Badge variant='default' className='px-1.5 py-0.5 text-xs'>
                    V{packageJson.version}
                  </Badge>
                  {hasNewVersion && (
                    <Badge variant='destructive' className='animate-pulse px-1.5 py-0.5 text-xs'>
                      {t('newVersionAvailable')}
                    </Badge>
                  )}
                </div>
              </div>
              {hasNewVersion && (
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 px-2 text-xs'
                  onClick={() =>
                    window.open(
                      latestReleases?.web?.url ||
                        'https://github.com/perfect-panel/ppanel-web/releases',
                      '_blank',
                    )
                  }
                >
                  <Icon icon='mdi:open-in-new' className='mr-1 h-3 w-3' />
                  {t('viewNewVersion')}
                </Button>
              )}
            </div>

            {/* 服务端版本 */}
            <div className='bg-muted/30 flex flex-1 items-center justify-between rounded-md p-2'>
              <div className='flex items-center'>
                <Icon icon='mdi:server' className='mr-2 h-4 w-4 text-blue-600' />
                <div className='flex items-center space-x-2'>
                  <span className='text-xs font-medium'>{t('serverVersion')}</span>
                  <Badge
                    variant={!systemInfo?.isRelease ? 'destructive' : 'default'}
                    className='px-1.5 py-0.5 text-xs'
                  >
                    {systemInfo?.version || 'V1.0.0'}
                    {!systemInfo?.isRelease && (
                      <span className='ml-1'>{t('developmentVersion')}</span>
                    )}
                  </Badge>
                  {hasServerNewVersion && (
                    <Badge variant='destructive' className='animate-pulse px-1.5 py-0.5 text-xs'>
                      {t('newVersionAvailable')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {hasServerNewVersion && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-6 px-2 text-xs'
                    onClick={() =>
                      window.open(
                        latestReleases?.server?.url ||
                          'https://github.com/perfect-panel/server/releases',
                        '_blank',
                      )
                    }
                  >
                    <Icon icon='mdi:open-in-new' className='mr-1 h-3 w-3' />
                    {t('viewNewVersion')}
                  </Button>
                )}
                <div className='text-muted-foreground hidden text-right text-xs sm:block'>
                  <div className='font-mono'>{systemInfo?.lastUpdated || '--'}</div>
                </div>
              </div>
            </div>
          </div>
          <Card className='overflow-hidden'>
            <CardHeader className='bg-secondary py-1'>
              <div className='flex items-center justify-between'>
                <CardTitle>{t('systemLogs')}</CardTitle>
                <Button variant='ghost' size='icon' disabled={isLoading} onClick={() => refetch()}>
                  <Icon
                    icon='uil:refresh'
                    className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span className='sr-only'>{t('refreshLogs')}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <ScrollArea className='h-[calc(100dvh-300px)] w-full rounded-md'>
                {isLoading ? (
                  <div className='flex h-full items-center justify-center'>
                    <Icon icon='uil:loading' className='text-primary h-8 w-8 animate-spin' />
                  </div>
                ) : (
                  <Accordion type='single' collapsible className='w-full'>
                    {logs?.map((log: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`} className='px-4'>
                        <AccordionTrigger className='hover:no-underline'>
                          <div className='flex w-full flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                            <span className='text-xs font-medium sm:text-sm'>{log.timestamp}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='px-2'>
                          {Object.entries(log).map(([key, value]) => (
                            <div
                              key={key}
                              className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm'
                            >
                              <span className='font-medium'>{key}:</span>
                              <span className='break-all'>{value as string}</span>
                            </div>
                          ))}
                          {/* <div className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm'>
                            <div className='font-medium'>{t('ip')}:</div>
                            <div>{log.ip}</div>
                            <div className='font-medium'>{t('request')}:</div>
                            <div className='break-all'>{log.request}</div>
                            <div className='font-medium'>{t('status')}:</div>
                            <div>{log.status}</div>
                            <div className='font-medium'>{t('caller')}:</div>
                            <div className='break-all'>{log.caller}</div>
                            <div className='font-medium'>{t('errors')}:</div>
                            <div className='break-all'>{log.errors || t('none')}</div>
                            <div className='font-medium'>{t('query')}:</div>
                            <div className='break-all'>{log.query || t('none')}</div>
                            <div className='font-medium'>{t('userAgent')}:</div>
                            <div className='break-all'>{log['user-agent']}</div>
                          </div> */}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
