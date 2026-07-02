import { useState } from 'react';
import type { FormField } from '../../../types/form';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FieldEditorProps {
  field: FormField | null;
  onUpdateField: (updated: FormField) => void;
}

export default function FieldEditor({ field, onUpdateField }: FieldEditorProps) {
  const [optionInput, setOptionInput] = useState('');

  if (!field) {
    return (
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center text-zinc-500">
        <ShieldAlert size={24} className="text-zinc-700 mb-2" />
        <p className="text-xs">Select a form field from the canvas to edit its properties.</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdateField({
      ...field,
      [key]: value
    });
  };

  const handleValidationChange = (key: string, value: any) => {
    onUpdateField({
      ...field,
      validation: {
        ...(field.validation || {}),
        [key]: value === '' ? null : value
      }
    });
  };

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    const currentOptions = field.options || [];
    if (currentOptions.includes(optionInput.trim())) return;
    handleChange('options', [...currentOptions, optionInput.trim()]);
    setOptionInput('');
  };

  const handleRemoveOption = (opt: string) => {
    const currentOptions = field.options || [];
    handleChange('options', currentOptions.filter(o => o !== opt));
  };

  const hasOptions = ['select', 'radio', 'multiselect'].includes(field.type);
  const hasPlaceholder = !['checkbox', 'rating', 'date', 'section'].includes(field.type);
  const hasValidation = ['text', 'textarea', 'number', 'email'].includes(field.type);

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 h-full flex flex-col gap-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
      <div>
        <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2">Field Settings</h3>
        <p className="text-[11px] font-mono text-cyan-400 capitalize bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-500/10 inline-block">
          Type: {field.type}
        </p>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
            Label Name
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Placeholder */}
        {hasPlaceholder && (
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
        )}

        {/* Help Text */}
        {field.type !== 'section' && (
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
              Help / Hint Text
            </label>
            <input
              type="text"
              value={field.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
        )}

        {/* Required Option */}
        {field.type !== 'section' && (
          <div className="flex items-center justify-between py-2 border-y border-zinc-900">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Mark as Mandatory (*)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500/20 peer-checked:after:bg-cyan-400 peer-checked:after:border-cyan-400"></div>
            </label>
          </div>
        )}

        {field.type === 'rating' && (
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
              Rating Scale
            </label>
            <Select
              value={String(field.scale || 5)}
              onValueChange={(v) => handleChange('scale', Number(v))}
            >
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white text-xs h-9 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="10">10 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Choices Options list */}
        {hasOptions && (
          <div className="space-y-2">
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Choice Items
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New option..."
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-700"
              />
              <button
                onClick={handleAddOption}
                className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-300 transition-all flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {(field.options || []).map(opt => (
                <div key={opt} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-zinc-300 truncate mr-2">{opt}</span>
                  <button
                    onClick={() => handleRemoveOption(opt)}
                    className="text-zinc-650 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(field.options || []).length === 0 && (
                <p className="text-[10px] text-zinc-600 italic">No option choices added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Validation rules */}
        {hasValidation && (
          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Validation Rules</h4>
            
            {field.type === 'number' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase mb-1">Min Value</label>
                  <input
                    type="number"
                    value={field.validation?.min !== undefined && field.validation?.min !== null ? field.validation.min : ''}
                    onChange={(e) => handleValidationChange('min', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase mb-1">Max Value</label>
                  <input
                    type="number"
                    value={field.validation?.max !== undefined && field.validation?.max !== null ? field.validation.max : ''}
                    onChange={(e) => handleValidationChange('max', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-zinc-500 uppercase mb-1">Min Length</label>
                    <input
                      type="number"
                      value={field.validation?.minLength !== undefined && field.validation?.minLength !== null ? field.validation.minLength : ''}
                      onChange={(e) => handleValidationChange('minLength', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-500 uppercase mb-1">Max Length</label>
                    <input
                      type="number"
                      value={field.validation?.maxLength !== undefined && field.validation?.maxLength !== null ? field.validation.maxLength : ''}
                      onChange={(e) => handleValidationChange('maxLength', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase mb-1">Regex Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g. ^[A-Z]{3}$"
                    value={field.validation?.pattern || ''}
                    onChange={(e) => handleValidationChange('pattern', e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
