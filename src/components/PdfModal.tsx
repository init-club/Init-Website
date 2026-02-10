import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLenis } from './SmoothScroll';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PdfModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
}

export default function PdfModal({ isOpen, onClose, pdfUrl }: PdfModalProps) {
    const lenis = useLenis();
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPageNumber(1);
            setScale(1.0);
            setIsLoading(true);
        }
    }, [isOpen]);

    // Lock scroll when modal is open — use Lenis stop/start, fallback to body overflow
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

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl h-[90vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#09090b]">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="text-cyan-400">Task Details</span>
                                <span className="text-gray-500 text-sm hidden sm:inline">
                                    {isLoading ? 'Loading...' : `Page ${pageNumber} of ${numPages}`}
                                </span>
                            </h3>

                            <div className="flex items-center gap-2">
                                {/* Zoom Controls (Desktop) */}
                                <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/10 mr-2">
                                    <button onClick={zoomOut} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Zoom Out">
                                        <ZoomOut size={16} />
                                    </button>
                                    <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                                    <button onClick={zoomIn} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Zoom In">
                                        <ZoomIn size={16} />
                                    </button>
                                </div>

                                <a
                                    href={pdfUrl}
                                    download
                                    className="p-2 hover:bg-white/10 text-cyan-400 rounded-lg transition-colors mr-2"
                                    title="Download PDF"
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-auto bg-[#1a1a1a] flex justify-center p-4 relative">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
                                </div>
                            )}

                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center p-10">
                                        <Loader2 className="animate-spin text-cyan-400" />
                                    </div>
                                }
                                error={
                                    <div className="text-red-400 p-10 text-center">
                                        Failed to load PDF. <br />
                                        <a href={pdfUrl} download className="underline mt-2 inline-block">Download instead</a>
                                    </div>
                                }
                                className="shadow-2xl"
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl border border-white/5"
                                />
                            </Document>
                        </div>

                        {/* Footer / Navigation */}
                        {numPages && (
                            <div className="p-4 border-t border-white/10 bg-[#09090b] flex items-center justify-center gap-4">
                                <button
                                    disabled={pageNumber <= 1}
                                    onClick={previousPage}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-gray-400 font-mono text-sm">
                                    {pageNumber} / {numPages}
                                </span>

                                <button
                                    disabled={pageNumber >= numPages}
                                    onClick={nextPage}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
