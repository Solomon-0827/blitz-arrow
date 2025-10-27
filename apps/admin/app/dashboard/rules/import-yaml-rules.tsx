'use client';

import { createRuleGroup } from '@/services/admin/server';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Progress } from '@workspace/ui/components/progress';
import { Textarea } from '@workspace/ui/components/textarea';
import { Icon } from '@workspace/ui/custom-components/icon';
import yaml from 'js-yaml';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImportYamlRulesProps {
  onImportSuccess?: () => void;
}

interface RuleGroup {
  name: string;
  rules: string[];
}

export default function ImportYamlRules({ onImportSuccess }: ImportYamlRulesProps) {
  const t = useTranslations('rules');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [yamlContent, setYamlContent] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setYamlContent(content);
      setOpen(true);
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  const processRule = (rule: string): { policyGroup: string; cleanRule: string } | null => {
    const parts = rule.split(',');

    if (parts.length === 1) {
      return null;
    }

    let policyGroup = 'default';
    let cleanRule = rule;

    if (parts.length >= 3) {
      const thirdPart = parts[2]?.trim();
      if (thirdPart) {
        policyGroup = thirdPart;
      }
    }

    cleanRule = parts.slice(0, 2).join(',');

    return { policyGroup, cleanRule };
  };

  const parseRulesIntoGroups = (rules: string[]): Record<string, string[]> => {
    const groups: Record<string, string[]> = {};

    for (const rule of rules) {
      if (!rule.trim()) continue;

      const result = processRule(rule);
      if (result === null) continue;

      const { policyGroup, cleanRule } = result;
      if (!groups[policyGroup]) {
        groups[policyGroup] = [];
      }

      // 不插入 MATCH 规则，只用于标识默认规则组
      if (!rule.trim().startsWith('MATCH,')) {
        groups[policyGroup].push(cleanRule);
      }
    }

    return groups;
  };

  const checkIfDefaultRule = (originalRules: string[], groupName: string): boolean => {
    return originalRules.some((rule) => {
      const trimmedRule = rule.trim();
      if (!trimmedRule.startsWith('MATCH,')) return false;

      // 检查 MATCH 规则是否属于当前组
      const parts = trimmedRule.split(',');
      if (parts.length >= 3) {
        const ruleGroup = parts[2]?.trim();
        return ruleGroup === groupName;
      }

      return groupName === 'default';
    });
  };

  const handleImport = async () => {
    if (!yamlContent) {
      toast.error(t('pleaseUploadFile'));
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    try {
      const parsedYaml = yaml.load(yamlContent) as any;

      if (!parsedYaml || !parsedYaml.rules) {
        throw new Error(t('invalidYamlFormat'));
      }

      let allRules: string[] = [];
      if (Array.isArray(parsedYaml.rules)) {
        allRules = parsedYaml.rules.filter((rule: string) => rule.trim());
      }

      if (allRules.length === 0) {
        throw new Error(t('noValidRules'));
      }

      const ruleGroups = parseRulesIntoGroups(allRules);
      const groups = Object.entries(ruleGroups).map(([name, rules]) => ({
        name,
        rules,
      }));

      setImportTotal(groups.length);
      setAnalyzing(false);

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (!group?.name || !group?.rules.length) continue;

        const isDefault = checkIfDefaultRule(allRules, group.name);

        await createRuleGroup({
          name: group.name,
          rules: group?.rules.join('\n'),
          enable: false,
          tags: [],
          icon: '',
          type: 'default',
          default: isDefault,
        });
        setImportProgress(i + 1);
      }

      toast.success(t('importSuccess'));
      setOpen(false);
      setYamlContent('');
      setImportProgress(0);
      setImportTotal(0);
      onImportSuccess?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : t('importFailed'));
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        accept='.yml,.yaml'
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <Button variant='default' onClick={() => fileInputRef.current?.click()}>
        {t('import')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{t('importYamlRules')}</DialogTitle>
            <DialogDescription>{t('importYamlDescription')}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {yamlContent && (
              <div className='grid gap-2'>
                <Label htmlFor='preview'>{t('preview')}</Label>
                <Textarea
                  id='preview'
                  value={yamlContent}
                  readOnly
                  rows={10}
                  className='font-mono text-xs'
                />
              </div>
            )}
            {importTotal > 0 && (
              <div className='grid gap-2'>
                <div className='flex justify-between text-sm'>
                  <span>{analyzing ? t('analyzing') : t('importing')}</span>
                  <span>
                    {importProgress} / {importTotal}
                  </span>
                </div>
                <Progress value={(importProgress / importTotal) * 100} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button onClick={handleImport} disabled={loading || !yamlContent}>
              {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
              {t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
