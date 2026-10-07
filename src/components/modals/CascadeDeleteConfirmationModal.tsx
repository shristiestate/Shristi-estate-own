import React from 'react';
import { AlertTriangle, AlertCircle, Trash2, X, Building2, Layers, Loader2 } from 'lucide-react';

export interface CascadeDeleteTarget {
  type: 'location' | 'building';
  id: string;
  name: string;
  buildingCount?: number;
  unitCount: number;
}

interface CascadeDeleteConfirmationModalProps {
  isOpen: boolean;
  target: CascadeDeleteTarget | null;
  isDeleting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CascadeDeleteConfirmationModal: React.FC<CascadeDeleteConfirmationModalProps> = ({
  isOpen,
  target,
  isDeleting,
  error,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !target) return null;

  const isLocation = target.type === 'location';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0B132B] border border-rose-200 dark:border-rose-900/60 shadow-2xl text-slate-900 dark:text-slate-100 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cascade-delete-title"
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={isDeleting}
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          aria-label="Cancel and close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1 pr-6">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Database Cascade Deletion
            </span>
            <h2 id="cascade-delete-title" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLocation ? 'Delete Location & All Related Data?' : 'Delete Building & All Related Units?'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: <strong className="text-slate-900 dark:text-white">{target.name}</strong>
            </p>
          </div>
        </div>

        {/* Cascade Impact Breakdown Card */}
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-3">
          <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider block">
            Items that will be permanently deleted:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {isLocation && (
              <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {target.buildingCount || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Related Buildings
                  </span>
                </div>
              </div>
            )}

            <div className={`p-3 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 ${!isLocation ? 'sm:col-span-2' : ''}`}>
              <Layers className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {target.unitCount}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Related Units / Spaces
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11.5px] leading-relaxed text-rose-800/90 dark:text-rose-300/90 pt-1 font-sans">
            {isLocation
              ? `Deleting this location triggers a single atomic transaction in the database that cascades to delete all ${target.buildingCount || 0} buildings and all ${target.unitCount} units under them.`
              : `Deleting this building triggers a single atomic transaction in the database that cascades to delete all ${target.unitCount} commercial units inside it.`
            }
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span>All-or-nothing transaction: If any constraint fails, the deletion will roll back completely.</span>
        </div>

        {/* Inline Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <span className="font-semibold block text-rose-900 dark:text-rose-200">Cascade Deletion Incomplete</span>
              <p className="text-[11.5px] leading-relaxed text-rose-700/90 dark:text-rose-300/90 break-words font-sans">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel (Keep Safe)
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cascading Deletion...</span>
              </>
            ) : error ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Retry Cascade Deletion</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {isLocation 
                    ? `Confirm Cascade Delete (${target.buildingCount || 0} Buildings, ${target.unitCount} Units)` 
                    : `Confirm Cascade Delete (${target.unitCount} Units)`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
