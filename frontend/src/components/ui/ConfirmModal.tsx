import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, Trash2, ShieldAlert, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  itemName?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  itemName,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="h-5 w-5 text-rose-600" />,
          btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
          iconBg: "bg-rose-50 ring-rose-100",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
          iconBg: "bg-amber-50 ring-amber-100",
        };
      case "primary":
      default:
        return {
          icon: <ShieldAlert className="h-5 w-5 text-blue-600" />,
          btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
          iconBg: "bg-blue-50 ring-blue-100",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      title={title}
      onClose={loading ? () => {} : onClose}
      size="sm"
      icon={styles.icon}
    >
      <div className="space-y-4 pt-1">
        <p className="text-sm text-slate-600 leading-relaxed">
          {message}
        </p>

        {itemName && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 break-all flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            {itemName}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm active:scale-95 transition disabled:opacity-60 ${styles.btn}`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
