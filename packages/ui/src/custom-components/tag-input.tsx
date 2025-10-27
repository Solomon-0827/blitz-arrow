import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  separator?: string;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder,
  separator = ',',
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(value);

  useEffect(() => {
    setTags(value.map((tag) => tag.trim()).filter((tag) => tag));
  }, [value]);

  function normalizeInput(input: string) {
    return input.replace(/，/g, ',');
  }

  function addTag() {
    const normalizedInput = normalizeInput(inputValue);
    const newTags = normalizedInput
      .split(separator)
      .map((tag) => tag.trim())
      .filter((tag) => tag && !tags.includes(tag));

    if (newTags.length > 0) {
      const updatedTags = [...tags, ...newTags];
      updateTags(updatedTags);
    }
    setInputValue('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === separator || event.key === '，') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && inputValue === '') {
      event.preventDefault();
      handleRemoveTag(tags.length - 1);
    }
  }

  function handleRemoveTag(index: number) {
    const newTags = tags.filter((_, i) => i !== index);
    updateTags(newTags);
  }

  function updateTags(newTags: string[]) {
    setTags(newTags);
    onChange?.(newTags);
  }

  return (
    <div
      className={cn(
        'border-input focus-within:ring-primary flex min-h-9 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent p-2 shadow-sm transition-colors focus-within:ring-1',
        className,
      )}
    >
      {tags.map((tag, index) => (
        <Badge
          key={tag}
          variant='outline'
          className='border-primary bg-primary/10 flex items-center gap-1 px-1'
        >
          {tag}
          <X className='size-4 cursor-pointer' onClick={() => handleRemoveTag(index)} />
        </Badge>
      ))}
      <Input
        className='h-full min-w-48 flex-1 border-none bg-transparent p-0 shadow-none !ring-0'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
      />
    </div>
  );
}

export default TagInput;
