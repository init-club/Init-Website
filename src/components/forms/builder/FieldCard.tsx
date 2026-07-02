import type { FormField } from '../../../types/form';
import {
  Trash2, Copy, Edit3, Type, Mail, Hash, AlignLeft,
  ChevronDown, ListPlus, CheckSquare, Calendar, Star, Columns, CheckSquare2,
  ChevronUp
} from 'lucide-react';

interface FieldCardProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const typeIcons: Record<string, any> = {
  text: Type,
  email: Mail,
  number: Hash,
  textarea: AlignLeft,
  select: ChevronDown,
  radio: CheckSquare,
  multiselect: ListPlus,
  checkbox: CheckSquare2,
  date: Calendar,
  rating: Star,
  section: Columns
};

export default function FieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown
}: FieldCardProps) {
  const Icon = typeIcons[field.type] || Type;

  return (
    <div
      className={`group relative bg-zinc-950/40 border rounded-2xl p-4 flex gap-3 transition-all duration-200 ${
        isSelected
          ? 'border-cyan-500/40 bg-cyan-500/3 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
          : 'border-zinc-900 hover:border-zinc-800'
      }`}
    >
      {/* Up / Down Reordering Buttons */}
      <div className="flex flex-col gap-1 items-center justify-center self-center mr-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
          className={`p-1 rounded hover:bg-zinc-900 transition-colors ${
            isFirst ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-500 hover:text-white'
          }`}
          title="Move Up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          className={`p-1 rounded hover:bg-zinc-900 transition-colors ${
            isLast ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-500 hover:text-white'
          }`}
          title="Move Down"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Field Details */}
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center gap-2 mb-1 cursor-pointer">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Icon size={12} className="text-zinc-400" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            {field.type} {field.required && <span className="text-red-500">*</span>}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-zinc-200 truncate cursor-pointer">
          {field.label || <span className="text-zinc-600 italic">Untitled Field</span>}
        </h4>
        {field.helpText && (
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{field.helpText}</p>
        )}
      </div>

      {/* Quick Actions overlay */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center bg-zinc-950/80 px-2 py-1 rounded-xl border border-zinc-900">
        <button
          onClick={onSelect}
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          title="Edit"
        >
          <Edit3 size={13} />
        </button>
        <button
          onClick={onDuplicate}
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          title="Duplicate"
        >
          <Copy size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
