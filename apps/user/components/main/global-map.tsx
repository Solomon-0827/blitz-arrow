'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Icon } from '@workspace/ui/custom-components/icon';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function GlobalMap() {
  const t = useTranslations('index');

  const locations = [
    { name: 'North America', servers: 120, flag: '🇺🇸' },
    { name: 'Europe', servers: 85, flag: '🇪🇺' },
    { name: 'Asia Pacific', servers: 95, flag: '🇯🇵' },
    { name: 'South America', servers: 45, flag: '🇧🇷' },
    { name: 'Africa', servers: 25, flag: '🇿🇦' },
    { name: 'Middle East', servers: 15, flag: '🇸🇦' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-2 text-center text-3xl font-bold'
      >
        {t('global_map_itle')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='text-muted-foreground mb-8 text-center text-lg'
      >
        {t('global_map_description')}
      </motion.p>

      <motion.div
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {locations.map((location, index) => (
          <motion.div
            key={location.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className='group hover:border-primary/50 transition-colors'>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='text-2xl'>{location.flag}</div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-sm'>{location.name}</h3>
                  <p className='text-xs text-muted-foreground'>{location.servers} nodes</p>
                </div>
                <Icon icon='uil:server' className='size-5 text-muted-foreground group-hover:text-primary transition-colors' />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
