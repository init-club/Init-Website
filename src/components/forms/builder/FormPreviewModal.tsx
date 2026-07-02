import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { FormField } from '../../../types/form';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fields: FormField[];
}

export default function FormPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  fields
}: FormPreviewModalProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const dialogTitleId = 'form-preview-title';
  const dialogDescriptionId = 'form-preview-description';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Top Info */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Eye size={18} className="text-cyan-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400">
                  Form Live Preview
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              <div className="border-b border-zinc-900 pb-4">
                <h1 id={dialogTitleId} className="text-2xl font-black font-heading text-white">
                  {title || 'Untitled Form'}
                </h1>
                {description && (
                  <p id={dialogDescriptionId} className="text-zinc-500 text-sm mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {sortedFields.map(field => {
                if (field.type === 'section') {
                  return (
                    <div key={field.id} className="pt-4 border-t border-zinc-900 first:border-t-0">
                      <h3 className="text-sm font-bold text-zinc-300 font-heading uppercase tracking-wide">
                        {field.label}
                      </h3>
                      {field.helpText && (
                        <p className="text-xs text-zinc-500 mt-0.5">{field.helpText}</p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      {field.label}{' '}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.helpText && (
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{field.helpText}</p>
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        disabled
                        className="w-full px-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                      />
                    )}

                    {field.type === 'email' && (
                      <input
                        type="email"
                        placeholder={field.placeholder}
                        disabled
                        className="w-full px-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        placeholder={field.placeholder}
                        disabled
                        className="w-full px-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        disabled
                        className="w-full px-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                      />
                    )}

                    {field.type === 'select' && (
                      <Select disabled>
                        <SelectTrigger className="w-full bg-zinc-900/40 border-zinc-900 text-zinc-400 text-sm rounded-xl cursor-not-allowed opacity-60">
                          <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === 'radio' && (
                      <RadioGroup disabled className="flex flex-col gap-2 opacity-60">
                        {(field.options || []).map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <RadioGroupItem value={opt} id={opt} className="border-zinc-700" />
                            <label htmlFor={opt} className="text-xs text-zinc-400">{opt}</label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.type === 'multiselect' && (
                      <div className="flex flex-col gap-2 opacity-60">
                        {(field.options || []).map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox id={`ms-${opt}`} disabled className="border-zinc-700" />
                            <label htmlFor={`ms-${opt}`} className="text-xs text-zinc-400">{opt}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="flex items-center gap-2 opacity-60">
                        <Checkbox id="preview-checkbox" disabled className="border-zinc-700" />
                        <label htmlFor="preview-checkbox" className="text-xs text-zinc-400">Confirm Choice</label>
                      </div>
                    )}

                    {field.type === 'date' && (
                      <input
                        type="date"
                        disabled
                        className="w-full px-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                      />
                    )}

                    {field.type === 'rating' && (
                      <div className="flex gap-1.5">
                        {Array.from({ length: field.scale || 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-600 font-mono"
                          >
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Info */}
            <div className="pt-4 border-t border-zinc-900 mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
