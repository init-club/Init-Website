import type { FieldType } from '../../../types/form';
import {
  Type, Mail, Hash, AlignLeft, ChevronDown, ListPlus, CheckSquare,
  Calendar, Star, Columns, CheckSquare2
} from 'lucide-react';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

interface PaletteItem {
  type: FieldType;
  label: string;
  icon: typeof Type;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  const items: PaletteItem[] = [
    { type: 'text', label: 'Short Text', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'textarea', label: 'Long Text', icon: AlignLeft },
    { type: 'select', label: 'Dropdown', icon: ChevronDown },
    { type: 'radio', label: 'Radio Choice', icon: CheckSquare },
    { type: 'multiselect', label: 'Multi-Select', icon: ListPlus },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare2 },
    { type: 'date', label: 'Date Pick', icon: Calendar },
    { type: 'rating', label: 'Star Rating', icon: Star },
    { type: 'section', label: '─ Section Divider ─', icon: Columns },
  ];

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 h-full flex flex-col gap-2.5">
      <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2">Field Elements</h3>
      <div className="flex flex-col gap-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddField(item.type)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-all text-left border border-zinc-800/40 hover:border-zinc-700"
            >
              <Icon size={14} className="text-zinc-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
