'use client';

import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { useTranslations } from 'next-intl';
import AppleForm from './forms/apple-form';
import DeviceForm from './forms/device-form';
import EmailLogsTable from './forms/email-logs-table';
import EmailSettingsForm from './forms/email-settings-form';
import FacebookForm from './forms/facebook-form';
import GithubForm from './forms/github-form';
import GoogleForm from './forms/google-form';
import PhoneLogsTable from './forms/phone-logs-table';
import PhoneSettingsForm from './forms/phone-settings-form';
import TelegramForm from './forms/telegram-form';

export default function Page() {
  const t = useTranslations('auth-control');

  // 定义表单配置
  const formSections = [
    {
      title: t('communicationMethods'),
      forms: [
        { component: EmailSettingsForm },
        { component: EmailLogsTable },
        { component: PhoneSettingsForm },
        { component: PhoneLogsTable },
      ],
    },
    {
      title: t('socialAuthMethods'),
      forms: [
        { component: AppleForm },
        { component: GoogleForm },
        { component: FacebookForm },
        { component: GithubForm },
        { component: TelegramForm },
      ],
    },
    {
      title: t('deviceAuthMethods'),
      forms: [{ component: DeviceForm }],
    },
  ];

  return (
    <div className='space-y-8'>
      {formSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h2 className='mb-4 text-lg font-semibold'>{section.title}</h2>
          <Table>
            <TableBody>
              {section.forms.map((form, formIndex) => {
                const FormComponent = form.component;
                return (
                  <TableRow key={formIndex}>
                    <TableCell>
                      <FormComponent />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
