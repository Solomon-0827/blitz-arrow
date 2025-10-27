import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { EnhancedInput, EnhancedInputProps } from '@workspace/ui/custom-components/enhanced-input';
import { cn } from '@workspace/ui/lib/utils';
import { CircleMinusIcon, CirclePlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FieldConfig extends Omit<EnhancedInputProps, 'type'> {
  name: string;
  type: 'text' | 'number' | 'select' | 'time' | 'boolean';
  options?: { label: string; value: string }[];
}

interface ObjectInputProps<T> {
  value: T;
  onChange: (value: T) => void;
  fields: FieldConfig[];
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ObjectInput<T extends Record<string, any>>({
  value,
  onChange,
  fields,
  className,
}: ObjectInputProps<T>) {
  const [internalState, setInternalState] = useState<T>(value);

  useEffect(() => {
    setInternalState(value);
  }, [value]);

  const updateField = (key: keyof T, fieldValue: string | number | boolean) => {
    const updatedInternalState = { ...internalState, [key]: fieldValue };
    setInternalState(updatedInternalState);
    onChange(updatedInternalState);
  };
  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'select':
        return (
          field.options && (
            <Combobox<string, false>
              placeholder={field.placeholder}
              options={field.options}
              value={internalState[field.name]}
              onChange={(fieldValue) => updateField(field.name, fieldValue)}
            />
          )
        );
      case 'boolean':
        return (
          <div className='flex h-full items-center space-x-2'>
            <Switch
              checked={internalState[field.name] as boolean}
              onCheckedChange={(fieldValue) => updateField(field.name, fieldValue)}
            />
            {field.placeholder && <Label>{field.placeholder}</Label>}
          </div>
        );
      default:
        return (
          <EnhancedInput
            value={internalState[field.name]}
            onValueChange={(fieldValue) => updateField(field.name, fieldValue)}
            {...field}
          />
        );
    }
  };
  return (
    <div className={cn('flex flex-1 flex-wrap gap-4', className)}>
      {fields.map((field) => (
        <div key={field.name} className={cn('flex-1', field.className)}>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
interface ArrayInputProps<T> {
  value?: T[];
  onChange: (value: T[]) => void;
  fields: FieldConfig[];
  isReverse?: boolean;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArrayInput<T extends Record<string, any>>({
  value = [],
  onChange,
  fields,
  isReverse = false,
  className,
}: ArrayInputProps<T>) {
  const initializeDefaultItem = (): T =>
    fields.reduce((acc, field) => {
      acc[field.name as keyof T] = undefined as T[keyof T];
      return acc;
    }, {} as T);

  const [displayItems, setDisplayItems] = useState<T[]>(() => {
    return value.length > 0 ? value : [initializeDefaultItem()];
  });

  const isItemModified = (item: T): boolean =>
    fields.some((field) => {
      const val = item[field.name];
      return val !== undefined && val !== null && val !== '';
    });

  const handleItemChange = (index: number, updatedItem: T) => {
    const newDisplayItems = [...displayItems];
    newDisplayItems[index] = updatedItem;
    setDisplayItems(newDisplayItems);

    const modifiedItems = newDisplayItems.filter(isItemModified);
    onChange(modifiedItems);
  };

  const createField = () => {
    if (isReverse) {
      setDisplayItems([initializeDefaultItem(), ...displayItems]);
    } else {
      setDisplayItems([...displayItems, initializeDefaultItem()]);
    }
  };

  const deleteField = (index: number) => {
    const newDisplayItems = displayItems.filter((_, i) => i !== index);
    setDisplayItems(newDisplayItems);

    const modifiedItems = newDisplayItems.filter(isItemModified);
    onChange(modifiedItems);
  };

  useEffect(() => {
    if (value.length > 0) {
      setDisplayItems(value);
    }
  }, [value]);

  return (
    <div className='flex flex-col gap-4'>
      {displayItems.map((item, index) => (
        <div key={index} className='flex items-center gap-4'>
          <ObjectInput
            value={item}
            onChange={(updatedItem) => handleItemChange(index, updatedItem)}
            fields={fields}
            className={className}
          />
          <div className='flex min-w-20 items-center'>
            {displayItems.length > 1 && (
              <Button
                variant='ghost'
                size='icon'
                type='button'
                className='text-destructive p-0 text-lg'
                onClick={() => deleteField(index)}
              >
                <CircleMinusIcon />
              </Button>
            )}
            {(isReverse ? index === 0 : index === displayItems.length - 1) && (
              <Button
                variant='ghost'
                size='icon'
                type='button'
                className='text-primary p-0 text-lg'
                onClick={createField}
              >
                <CirclePlusIcon />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
