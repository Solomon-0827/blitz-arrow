import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  formatInput?: (value: string | number) => string | number;
  formatOutput?: (value: string | number) => string | number;
  onValueChange?: (value: string | number) => void;
  onValueBlur?: (value: string | number) => void;
  min?: number;
  max?: number;
}

export function EnhancedInput({
  suffix,
  prefix,
  formatInput,
  formatOutput,
  value: initialValue,
  className,
  onValueChange,
  onValueBlur,
  ...props
}: EnhancedInputProps) {
  const getProcessedValue = (inputValue: unknown) => {
    if (inputValue === '' || inputValue === 0 || inputValue === '0') return '';
    const newValue = String(inputValue ?? '');
    return formatInput ? formatInput(newValue) : newValue;
  };

  const [value, setValue] = useState<string | number>(() => getProcessedValue(initialValue));
  // @ts-expect-error - This is a controlled component
  const [internalValue, setInternalValue] = useState<string | number>(initialValue ?? '');

  useEffect(() => {
    if (initialValue !== internalValue) {
      const newValue = getProcessedValue(initialValue);
      if (value !== newValue) {
        setValue(newValue);
        // @ts-expect-error - This is a controlled component
        setInternalValue(initialValue ?? '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, formatInput]);

  const processValue = (inputValue: string | number) => {
    let processedValue: number | string = inputValue?.toString().trim();

    if (processedValue === '0' && props.type === 'number') {
      return 0;
    }

    if (processedValue && props.type === 'number') processedValue = Number(processedValue);
    return formatOutput ? formatOutput(processedValue) : processedValue;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    if (props.type === 'number') {
      if (inputValue === '0') {
        setValue('');
        setInternalValue(0);
        onValueChange?.(0);
        return;
      }

      if (/^-?\d*\.?\d*$/.test(inputValue) || inputValue === '-' || inputValue === '.') {
        const numericValue = Number(inputValue);
        if (!isNaN(numericValue) && inputValue !== '-' && inputValue !== '.') {
          const min = Number.isFinite(props.min) ? props.min : -Infinity;
          const max = Number.isFinite(props.max) ? props.max : Infinity;
          const constrainedValue = Math.max(min!, Math.min(max!, numericValue));
          inputValue = String(constrainedValue);
          setInternalValue(constrainedValue);
        } else {
          setInternalValue(inputValue);
        }
        setValue(inputValue === '0' ? '' : inputValue);
      }
    } else {
      setValue(inputValue);
      setInternalValue(inputValue);
    }

    const outputValue = processValue(inputValue);
    onValueChange?.(outputValue);
  };

  const handleBlur = () => {
    if (props.type === 'number' && value) {
      if (value === '-' || value === '.') {
        setValue('');
        setInternalValue('');
        onValueBlur?.('');
        return;
      }

      // 确保0值显示为空
      if (value === '0') {
        setValue('');
        onValueBlur?.(0);
        return;
      }
    }

    const outputValue = processValue(value);
    if ((initialValue || '') !== outputValue) {
      onValueBlur?.(outputValue);
    }
  };

  const renderPrefix = () => {
    return typeof prefix === 'string' ? (
      <div className='bg-muted relative mr-px flex h-9 items-center text-nowrap px-3'>{prefix}</div>
    ) : (
      prefix
    );
  };

  const renderSuffix = () => {
    return typeof suffix === 'string' ? (
      <div className='bg-muted relative ml-px flex h-9 items-center text-nowrap px-3'>{suffix}</div>
    ) : (
      suffix
    );
  };

  return (
    <div
      className={cn(
        'border-input flex w-full items-center overflow-hidden rounded-md border',
        className,
      )}
      suppressHydrationWarning
    >
      {renderPrefix()}
      <Input
        step={0.01}
        {...props}
        value={value}
        className='block rounded-none border-none'
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderSuffix()}
    </div>
  );
}
