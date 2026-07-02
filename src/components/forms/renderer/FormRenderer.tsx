import { useState, useEffect, useRef } from 'react';
import type { FormField } from '../../../types/form';
import { validateAnswers } from '../../../utils/formUtils';
import { Loader2, Check, ChevronDown, Calendar, AlertCircle, AlertTriangle } from 'lucide-react';
import FormProgress from './FormProgress';

interface FormRendererProps {
  fields: FormField[];
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  isSubmitting: boolean;
  showProgressBar?: boolean;
}

// Custom Select Component to replace native browser dropdowns
function CustomFormSelect({
  placeholder,
  value,
  options,
  onChange
}: {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl text-sm text-white focus:outline-none transition-colors text-left"
      >
        <span className={value ? 'text-zinc-200' : 'text-zinc-500'}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-zinc-950 border border-zinc-900 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
          >
            {placeholder}
          </button>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                value === opt
                  ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>{opt}</span>
              {value === opt && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FormRenderer({
  fields,
  onSubmit,
  isSubmitting,
  showProgressBar = true
}: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  // Sort fields by their orders
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  // Filter out sections for count metrics
  const inputFields = sortedFields.filter(f => f.type !== 'section');

  const filledCount = inputFields.filter(field => {
    const val = answers[field.id];
    return val !== undefined && val !== null && (typeof val === 'string' ? val.trim() !== '' : true) && (Array.isArray(val) ? val.length > 0 : true);
  }).length;

  const handleValueChange = (fieldId: string, val: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: val
    }));

    // If already tried submitting, run live validation on update
    if (hasTriedSubmit) {
      const liveErrors = validateAnswers(fields, { ...answers, [fieldId]: val });
      setErrors(prev => ({
        ...prev,
        [fieldId]: liveErrors[fieldId]
      }));
    }
  };

  const handleMultiSelectChange = (fieldId: string, option: string, isChecked: boolean) => {
    const currentList = answers[fieldId] || [];
    let updatedList;
    if (isChecked) {
      updatedList = [...currentList, option];
    } else {
      updatedList = currentList.filter((o: string) => o !== option);
    }
    handleValueChange(fieldId, updatedList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasTriedSubmit(true);

    const submissionErrors = validateAnswers(fields, answers);
    setErrors(submissionErrors);

    const hasErrors = Object.values(submissionErrors).some(err => err !== null);
    if (hasErrors) {
      // Find first error and scroll to it
      const firstErrorId = Object.keys(submissionErrors).find(key => submissionErrors[key] !== null);
      if (firstErrorId) {
        document.getElementById(`el-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    await onSubmit(answers);
  };

  const hasFormErrors = hasTriedSubmit && Object.values(errors).some(err => err !== null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      {showProgressBar && inputFields.length > 0 && (
        <FormProgress total={inputFields.length} filled={filledCount} />
      )}

      {/* Global Validation Alert Card */}
      {hasFormErrors && (
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="text-red-400 flex-shrink-0" size={18} />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">Please check your submissions</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              Some fields are incomplete or invalid. Look for the highlighted sections below.
            </p>
          </div>
        </div>
      )}

      {/* Field Elements */}
      <div className="space-y-6">
        {sortedFields.map(field => {
          const fieldError = errors[field.id];

          if (field.type === 'section') {
            return (
              <div key={field.id} id={`el-${field.id}`} className="pt-6 border-t border-zinc-900 first:border-t-0">
                <h3 className="text-base font-bold text-zinc-200 font-heading uppercase tracking-wide">
                  {field.label}
                </h3>
                {field.helpText && (
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{field.helpText}</p>
                )}
              </div>
            );
          }

          return (
            <div
              key={field.id}
              id={`el-${field.id}`}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                fieldError
                  ? 'border-red-500/25 bg-red-500/2 shadow-[0_0_15px_rgba(239,68,68,0.02)]'
                  : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
              }`}
            >
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {field.label}{' '}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.helpText && (
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{field.helpText}</p>
              )}

              {/* Text / Email Input */}
              {['text', 'email'].includes(field.type) && (
                <input
                  type={field.type}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl text-sm text-white focus:outline-none transition-colors"
                />
              )}

              {/* Number Input */}
              {field.type === 'number' && (
                <input
                  type="number"
                  value={answers[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl text-sm text-white focus:outline-none transition-colors"
                />
              )}

              {/* Textarea Input */}
              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl text-sm text-white focus:outline-none transition-colors resize-none"
                />
              )}

              {/* Custom Dropdown Select */}
              {field.type === 'select' && (
                <CustomFormSelect
                  placeholder="Select an option"
                  value={answers[field.id] || ''}
                  options={field.options || []}
                  onChange={(val) => handleValueChange(field.id, val)}
                />
              )}

              {/* Custom Radio Choices */}
              {field.type === 'radio' && (
                <div className="flex flex-col gap-2">
                  {(field.options || []).map(opt => {
                    const isSelected = answers[field.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleValueChange(field.id, opt)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <span className="text-xs font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom Multi-Select Checkboxes */}
              {field.type === 'multiselect' && (
                <div className="flex flex-col gap-2">
                  {(field.options || []).map(opt => {
                    const list = answers[field.id] || [];
                    const isChecked = list.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleMultiSelectChange(field.id, opt, !isChecked)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                          isChecked ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {isChecked && <Check size={10} className="text-black stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom Single Checkbox */}
              {field.type === 'checkbox' && (
                <button
                  type="button"
                  onClick={() => handleValueChange(field.id, !answers[field.id])}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                    answers[field.id]
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                    answers[field.id] ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-700 bg-zinc-900'
                  }`}>
                    {answers[field.id] && <Check size={10} className="text-black stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium">Confirm and Accept</span>
                </button>
              )}

              {/* Custom Styled Date Input */}
              {field.type === 'date' && (
                <div className="relative">
                  <input
                    type="date"
                    value={answers[field.id] || ''}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl text-sm text-white focus:outline-none transition-colors cursor-pointer scheme-dark"
                  />
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              )}

              {/* Star Rating Scale */}
              {field.type === 'rating' && (
                <div className="flex gap-2">
                  {Array.from({ length: field.scale || 5 }).map((_, idx) => {
                    const val = idx + 1;
                    const isActive = answers[field.id] === val;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleValueChange(field.id, val)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          isActive
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inline Error Helper callout */}
              {fieldError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-900/30 px-3.5 py-2 rounded-xl mt-3 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <span>{fieldError}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-zinc-900 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-white/5"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Response'
          )}
        </button>
      </div>
    </form>
  );
}
