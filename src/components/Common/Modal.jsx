import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-md" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-neutral-800">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-brand"
                            >
                                <Icon icon="solar:close-circle-bold" className="text-2xl" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
