import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'info',
  isLoading = false
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const variantColors = {
    danger: {
      btn: 'bg-red-500 hover:bg-red-650 text-white',
      icon: 'text-red-400 bg-red-500/10 border-red-500/20'
    },
    warning: {
      btn: 'bg-yellow-500 hover:bg-yellow-600 text-black',
      icon: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    },
    info: {
      btn: 'bg-white hover:bg-zinc-200 text-black',
      icon: 'text-zinc-400 bg-zinc-900/60 border-zinc-800'
    }
  };

  const style = variantColors[variant] || variantColors.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl z-10"
          >
            {/* Close Cross */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            {/* Content Layout */}
            <div className="flex items-start gap-4">
              <div className={`p-2 border rounded-lg shrink-0 ${style.icon}`}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{message}</p>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-transparent border border-zinc-900 hover:bg-zinc-900 text-zinc-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 ${style.btn}`}
              >
                {isLoading && <Loader2 size={12} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
