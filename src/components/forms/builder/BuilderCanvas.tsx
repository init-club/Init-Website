import type { FormField } from '../../../types/form';
import FieldCard from './FieldCard';
import { Clipboard } from 'lucide-react';

interface BuilderCanvasProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
}

export default function BuilderCanvas({
  fields,
  onFieldsChange,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDuplicateField
}: BuilderCanvasProps) {
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const reorderedFields = [...fields];
    // Swap fields
    const temp = reorderedFields[index];
    reorderedFields[index] = reorderedFields[newIndex];
    reorderedFields[newIndex] = temp;

    // Update order key
    const updatedFields = reorderedFields.map((field, idx) => ({
      ...field,
      order: idx
    }));

    onFieldsChange(updatedFields);
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 min-h-[60vh] flex flex-col gap-4">
      {fields.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-zinc-900 rounded-xl">
          <Clipboard size={32} className="text-zinc-700 mb-3" />
          <p className="text-sm font-semibold text-zinc-400">Builder Canvas Empty</p>
          <p className="text-xs text-zinc-650 max-w-[200px] mt-1">
            Click elements on the left panel to build your form.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <FieldCard
              key={field.id}
              field={field}
              isSelected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => onDeleteField(field.id)}
              onDuplicate={() => onDuplicateField(field.id)}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              onMoveUp={() => moveField(index, 'up')}
              onMoveDown={() => moveField(index, 'down')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
