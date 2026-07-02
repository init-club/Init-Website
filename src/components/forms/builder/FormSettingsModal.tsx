import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, AlertCircle } from 'lucide-react';
import type { FormSettings } from '../../../types/form';

interface FormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FormSettings;
  onSaveSettings: (settings: FormSettings) => void;
}

export default function FormSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}: FormSettingsModalProps) {
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [requireAuth, setRequireAuth] = useState(false);
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [successMessage, setSuccessMessage] = useState('Thank you for your response!');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [maxResponses, setMaxResponses] = useState('');
  const [showProgressBar, setShowProgressBar] = useState(true);
  const dialogTitleId = 'form-settings-title';
  const dialogDescriptionId = 'form-settings-description';

  useEffect(() => {
    if (settings) {
      setAllowMultiple(settings.allow_multiple_responses);
      setRequireAuth(settings.require_auth);
      setOpenAt(settings.open_at ? settings.open_at.slice(0, 16) : '');
      setCloseAt(settings.close_at ? settings.close_at.slice(0, 16) : '');
      setSuccessMessage(settings.success_message || 'Thank you for your response!');
      setRedirectUrl(settings.redirect_url || '');
      setMaxResponses(settings.max_responses ? String(settings.max_responses) : '');
      setShowProgressBar(settings.show_progress_bar !== false);
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    onSaveSettings({
      allow_multiple_responses: allowMultiple,
      require_auth: requireAuth,
      open_at: openAt ? new Date(openAt).toISOString() : null,
      close_at: closeAt ? new Date(closeAt).toISOString() : null,
      success_message: successMessage.trim(),
      redirect_url: redirectUrl.trim() || null,
      max_responses: maxResponses ? Number(maxResponses) : null,
      show_progress_bar: showProgressBar
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-4">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-zinc-400" />
                <h3 id={dialogTitleId} className="text-sm font-bold text-white font-heading">Global Form Settings</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div id={dialogDescriptionId} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Allow Multi-Submit
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-455 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500/20 peer-checked:after:bg-cyan-400"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Show Progress Bar
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProgressBar}
                      onChange={(e) => setShowProgressBar(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-455 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500/20 peer-checked:after:bg-cyan-400"></div>
                  </label>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Open Form At
                  </label>
                  <input
                    type="datetime-local"
                    value={openAt}
                    onChange={(e) => setOpenAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Close Form At
                  </label>
                  <input
                    type="datetime-local"
                    value={closeAt}
                    onChange={(e) => setCloseAt(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Success Message */}
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Success Message
                </label>
                <textarea
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Redirect URL */}
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Redirect URL (After Submit)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Max Responses Limit */}
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                  Max Submissions Limit
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900 mt-5">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-semibold transition-all"
              >
                Apply Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
