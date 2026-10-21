"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

import { apiClient } from "@/lib/api/client";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  itemIdentifier?: string;
  deleteUrl?: string;
  deletePayload?: any;
  customDeleteFn?: () => Promise<void>;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  itemIdentifier,
  deleteUrl,
  deletePayload,
  customDeleteFn,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (customDeleteFn) {
        await customDeleteFn();
        toast.success(`${title} completed successfully.`);
        onSuccess();
        onClose();
        return;
      }

      if (!deleteUrl) {
        toast.error("No deletion endpoint specified.");
        return;
      }

      const endpoint = deleteUrl.startsWith("/api") ? deleteUrl.replace(/^\/api/, "") : deleteUrl;
      const res = await apiClient.request({
        url: endpoint,
        method: deletePayload ? "POST" : "DELETE",
        data: deletePayload,
      });
      const data = res.data;

      if (data && (data.success || !data.error)) {
        toast.success(data.message || "Item deleted successfully.");
        onSuccess();
        onClose();
      } else {
        toast.error(data?.error || "Failed to delete item.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error during deletion.");
    } finally {
      setLoading(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative isolate">
        {/* Top Warning Banner */}
        <div className="p-6 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-rose-700 font-medium">Permanent System Action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {itemIdentifier && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 break-all">
              Target: <strong>{itemIdentifier}</strong>
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>This action cannot be undone. All linked cascading records will be permanently removed.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-3xl">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer hover:scale-102"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}
