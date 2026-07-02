import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react'; 
import { supabase } from '../../../supabaseClient';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessDeniedModal = ({ isOpen, onClose }: AccessDeniedModalProps) => {
  const handleRedirect = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-black border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center relative overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-red-500/5 z-0 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertTriangle size={32} className="text-red-500" />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-wider">ACCESS DENIED</h2>
                <p className="text-gray-400 text-sm">
                  You are not a registered member of The Init Club GitHub Organization.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={handleRedirect}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={16} /> Sign Out & Go Home
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccessDeniedModal;