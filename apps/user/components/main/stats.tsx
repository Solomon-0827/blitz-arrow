'use client';

import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function Stats() {
  const t = useTranslations('index');
  const sections = [
    {
      title: 'No Compromise',
      body: [
        "We don't fuck around your data.",
        'And we value your Opsec.',
        'End-to-End encryption, RSA/AES-256/HKDF-AEAD.',
        "There's no adblock service integrated, yes.",
        "You won’t be saving data. Yes.",
        "but that means even us can't see what are you cooking.",
      ].join('\n'),
    },
    {
      title: 'Speed is Life',
      body: [
        'Choose your proximity entry node and out node.',
        'Balance your load,',
        'Get speed at full potential.',
        "Leave ‘em bite the dust.",
      ].join('\n'),
    },
    {
      title: 'Serve with Purity',
      body: [
        'We don’t require any of your personal info (or steal it),',
        'No Delete-My-Data please, no file scanning. Just proxy.',
      ].join('\n'),
    },
  ];


  const GradientMaskIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
    const url = `https://api.iconify.design/${icon.replace(':', '/')}.svg`;
    return (
      <span
        className={`inline-block ${className} bg-gradient-to-br from-white/90 to-black/70 dark:from-white/70 dark:to-black`}
        style={{
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  };

  return (
    <div className='relative'>
      {/* Animated background orbs */}
      <motion.section
        className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.5 }}
      >
        {sections.map((s, index) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Card className='h-full'>
              <CardHeader className='text-3xl font-extrabold'>
                {s.title}
              </CardHeader>
              <CardContent>
                <p className='whitespace-pre-line h-full text-sm leading-relaxed text-muted-foreground'>
                  {s.body}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Second row of feature cards */}
      <motion.h3
        className='mt-8 text-start text-2xl font-bold pb-4 pt-6'
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        {t('feature_row_title')}
      </motion.h3>
      <motion.section
        className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.5 }}
      >
        {[
          {
            title: t('feature_how_title'),
            description: t('feature_how_desc'),
            icon: 'ph:arrows-clockwise-thin',
          },
          {
            title: t('feature_smart_title'),
            description: t('feature_smart_desc'),
            icon: 'ph:compass-thin',
          },
          {
            title: t('feature_devices_title'),
            description: t('feature_devices_desc'),
            icon: 'ph:devices-thin',
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Card className='h-full'>
              <CardHeader className='text-3xl font-extrabold'>
                <div className='mb-2 flex w-full items-center justify-center'>
                  <GradientMaskIcon icon={feature.icon} className='h-16 w-16' />
                </div>
                <span>{feature.title}</span>
              </CardHeader>
              <CardContent>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
