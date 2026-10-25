import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  footer?: ReactNode;
}

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
  full: "max-w-5xl",
};

export function Modal({
  title,
  subtitle,
  icon,
  onClose,
  children,
  size = "md",
  footer,
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Save initial overflow and lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
      />

      {/* Modal Dialog Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className={`relative w-full ${SIZE_MAP[size]} rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xl z-10 my-auto max-h-[92vh] flex flex-col overflow-hidden`}
      >
        {/* Top vibrant brand accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-400" />

        {/* Header */}
        <div className="mb-4 sm:mb-5 flex items-start justify-between gap-3 shrink-0 pt-1">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
                {icon}
              </div>
            )}
            <div>
              <h2 id="modal-headline" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body with responsive scroll */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-slate-700 text-sm">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );

  // Mount directly to document body to escape any container clipping or z-index context
  return typeof document !== "undefined"
    ? createPortal(<AnimatePresence mode="wait">{modalContent}</AnimatePresence>, document.body)
    : modalContent;
}
