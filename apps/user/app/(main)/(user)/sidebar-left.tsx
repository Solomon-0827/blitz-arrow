'use client';
import { navs } from '@/config/navs';
import { cn } from '@workspace/ui/lib/utils';
import { Icon } from '@workspace/ui/custom-components/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarLeft({ className, ...props }: React.ComponentProps<'aside'>) {
  const t = useTranslations('menu');
  const pathname = usePathname();
  
  // Get all nav items with groups as default open values
  const defaultOpenValues = navs
    .filter((nav) => nav.items)
    .map((nav) => nav.title);

  return (
    <aside className={cn('flex flex-col gap-4 overflow-y-auto p-4', className)} {...props}>
      <div className='bg-background/95 flex flex-col gap-3 rounded-3xl border border-border p-4 backdrop-blur-md'>
        <Accordion type='multiple' defaultValue={defaultOpenValues} className='w-full space-y-2'>
          {navs.map((nav) => {
            // Single item without group
            if (!nav.items) {
              const isActive = nav.url === pathname;
              return (
                <Link
                  key={nav.title}
                  href={nav.url!}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-5 py-3.5 text-base font-medium transition-all',
                    isActive
                      ? 'bg-foreground text-background shadow-md'
                      : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                  )}
                >
                  {nav.icon && <Icon icon={nav.icon} className='size-5' />}
                  <span>{t(nav.title)}</span>
                </Link>
              );
            }

            // Group with accordion
            return (
              <AccordionItem key={nav.title} value={nav.title} className='border-none'>
                <AccordionTrigger className='hover:bg-accent rounded-2xl px-5 py-3 text-base font-semibold hover:no-underline'>
                  <div className='flex items-center gap-3'>
                    {nav.groupIcon && <Icon icon={nav.groupIcon} className='size-5' />}
                    <span>{t(nav.title)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pb-0 pt-2'>
                  <div className='flex flex-col gap-1 pl-2'>
                    {nav.items.map((item) => {
                      const isActive = item.url === pathname;
                      return (
                        <Link
                          key={item.title}
                          href={item.url}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-foreground text-background shadow-md'
                              : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                          )}
                        >
                          {item.icon && <Icon icon={item.icon} className='size-5' />}
                          <span>{t(item.title)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
}
