import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { useLenis } from '../../layout/SmoothScroll';

interface PdfModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
}

export default function PdfModal({ isOpen, onClose, pdfUrl }: PdfModalProps) {
    const lenis = useLenis();

    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            lenis?.stop();
            document.body.style.overflow = 'hidden';
        } else {
            lenis?.start();
            document.body.style.overflow = 'unset';
        }
        return () => {
            lenis?.start();
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, lenis]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Task Sheet PDF"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl h-[90vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#09090b] flex-shrink-0">
                            <h3 className="text-white font-bold">
                                <span className="text-cyan-400">Task Details</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={pdfUrl}
                                    download="Init_Club_Induction_Tasks.pdf"
                                    className="p-2 hover:bg-white/10 text-cyan-400 rounded-lg transition-colors"
                                    title="Download PDF"
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Browser-native PDF viewer */}
                        <iframe
                            src={pdfUrl}
                            className="flex-1 w-full border-0"
                            title="Init Club Task Sheet"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
