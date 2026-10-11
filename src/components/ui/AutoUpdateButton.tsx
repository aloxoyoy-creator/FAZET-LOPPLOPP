import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { checkForUpdate, forceUpdateApp, type VersionInfo } from '../../services/appUpdateService';

interface AutoUpdateButtonProps {
  variant?: 'header' | 'button' | 'settings';
  className?: string;
}

export default function AutoUpdateButton({ variant = 'header', className = '' }: AutoUpdateButtonProps) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState<VersionInfo | undefined>();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check for updates on mount
    void checkForUpdate().then((res) => {
      if (res.hasUpdate) {
        setHasUpdate(true);
        setNewVersion(res.newVersion);
      }
    });

    // Check periodically every 5 minutes
    const interval = setInterval(() => {
      void checkForUpdate().then((res) => {
        if (res.hasUpdate) {
          setHasUpdate(true);
          setNewVersion(res.newVersion);
        }
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTriggerUpdate = async () => {
    setLoading(true);
    setStatusMsg('Memeriksa server Vercel...');
    try {
      await forceUpdateApp((msg) => {
        setStatusMsg(msg);
      });
      setSuccess(true);
    } catch {
      setStatusMsg('Gagal memuat ulang, mencoba reload biasa...');
      window.location.reload();
    }
  };

  if (variant === 'settings') {
    return (
      <div className="p-5 rounded-3xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--tf-text-primary)] flex items-center gap-2">
                Pembaruan Aplikasi (Auto-Update)
                {hasUpdate && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 animate-pulse">
                    Tersedia Versi Baru!
                  </span>
                )}
              </h3>
              <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
                Sinkronkan pembaruan langsung dari Vercel/Firebase tanpa harus menghapus cache aplikasi di pengaturan Android.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleTriggerUpdate()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            <span>{loading ? statusMsg : 'Perbarui Aplikasi & Bersihkan Cache Sekarang'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Header variant
  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-all duration-200 ${
          hasUpdate
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-sm animate-pulse'
            : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-text-muted)] hover:text-[var(--tf-text-primary)] hover:border-[var(--tf-primary-subtle)]'
        } ${className}`}
        title={hasUpdate ? 'Pembaruan aplikasi Vercel tersedia! Klik untuk perbarui.' : 'Auto Update / Sinkronisasi Pembaruan'}
        aria-label="Cek Pembaruan Aplikasi"
      >
        <RefreshCw size={17} className={hasUpdate ? 'animate-spin text-emerald-500' : ''} style={{ animationDuration: '6s' }} />
        {hasUpdate && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--tf-text-primary)]">
                  {hasUpdate ? 'Pembaruan Baru Tersedia! 🚀' : 'Periksa & Segarkan Aplikasi'}
                </h3>
                <p className="text-xs text-[var(--tf-text-muted)]">
                  Sinkronisasi langsung dengan build Vercel / Firebase
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--tf-bg-subtle)] text-xs text-[var(--tf-text-muted)] space-y-2">
              <p>
                Fitur ini akan <strong>membersihkan cache internal WebView & Service Worker</strong> secara instan dan memuat ulang kode terbaru yang baru di-deploy.
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                ✅ Tanpa perlu menghapus data atau cache di pengaturan Android secara manual.
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Loader2 size={16} className="animate-spin" />
                <span>{statusMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--tf-text-muted)] hover:bg-[var(--tf-bg-subtle)] transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleTriggerUpdate()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Perbarui Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
