'use client';

import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { useTranslations } from 'next-intl';
import CurrencyForm from './basic-settings/currency-form';
import PrivacyPolicyForm from './basic-settings/privacy-policy-form';
import SiteForm from './basic-settings/site-form';
import TosForm from './basic-settings/tos-form';
import InviteForm from './user-security/invite-form';
import RegisterForm from './user-security/register-form';
import VerifyCodeForm from './user-security/verify-code-form';
import VerifyForm from './user-security/verify-form';

export default function Page() {
  const t = useTranslations('system');

  // 定义表单配置
  const formSections = [
    {
      title: t('basicSettings'),
      forms: [
        { component: SiteForm },
        { component: CurrencyForm },
        { component: TosForm },
        { component: PrivacyPolicyForm },
      ],
    },
    {
      title: t('userSecuritySettings'),
      forms: [
        { component: RegisterForm },
        { component: InviteForm },
        { component: VerifyForm },
        { component: VerifyCodeForm },
      ],
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
