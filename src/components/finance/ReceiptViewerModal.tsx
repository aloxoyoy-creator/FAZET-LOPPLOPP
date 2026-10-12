import { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  Receipt,
  Calendar,
  CreditCard,
  Building2,
  Tag
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatRupiah, getCategoryById, getPaymentMethodById } from '../../data/financeCategories';
import type { FinanceTransaction } from '../../types/finance';

interface Props {
  transaction: FinanceTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptViewerModal({ transaction, isOpen, onClose }: Props) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!transaction || !isOpen) return null;

  const category = getCategoryById(transaction.category);
  const paymentMethod = getPaymentMethodById(transaction.paymentMethod);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (!transaction.receiptUrl) return;
    const link = document.createElement('a');
    link.href = transaction.receiptUrl;
    link.download = transaction.receiptName || `bukti_transfer_${transaction.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bukti Transfer & Pembayaran" maxWidth="xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Kolom Kiri: Image Viewer with controls */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full h-[360px] sm:h-[440px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
            {transaction.receiptUrl ? (
              <img
                src={transaction.receiptUrl}
                alt="Bukti Transfer"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-full max-w-full object-contain cursor-grab active:cursor-grabbing select-none"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Receipt size={48} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Tidak ada gambar bukti pembayaran yang terlampir.</p>
              </div>
            )}

            {/* Float Controls on top of image */}
            {transaction.receiptUrl && (
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/60 text-white w-fit mx-auto shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-[11px] font-mono px-1 font-bold">{(zoom * 100).toFixed(0)}%</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Putar 90 Derajat"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] uppercase font-bold px-2 py-1 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {transaction.receiptUrl && (
            <div className="flex items-center gap-2 mt-3 w-full justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                icon={<Download size={14} />}
                className="rounded-xl text-xs"
              >
                Unduh Bukti
              </Button>
              <a
                href={transaction.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ExternalLink size={14} /> Buka Tab Baru
              </a>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Transaction Metadata Card */}
        <div className="w-full lg:w-80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header / Nominal */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-[var(--tf-border)]">
              <span className="text-[10px] uppercase font-black tracking-wider text-[var(--tf-text-muted)] block mb-1">
                {transaction.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </span>
              <div
                className={`text-2xl font-black font-mono ${
                  transaction.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatRupiah(transaction.amount)}
              </div>
              <div className="mt-2 text-xs font-semibold text-[var(--tf-text-primary)]">
                {transaction.description}
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--tf-bg-subtle)]">
                <span className="text-[var(--tf-text-muted)] flex items-center gap-1.5">
                  <Tag size={13} /> Kategori
                </span>
                <span className="font-bold flex items-center gap-1">
                  <span>{category.name}</span>
                </span>
              </div>

              {transaction.merchant && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--tf-bg-subtle)]">
                  <span className="text-[var(--tf-text-muted)] flex items-center gap-1.5">
                    <Building2 size={13} /> Merchant / Toko
                  </span>
                  <span className="font-semibold text-[var(--tf-text-primary)]">{transaction.merchant}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--tf-bg-subtle)]">
                <span className="text-[var(--tf-text-muted)] flex items-center gap-1.5">
                  <CreditCard size={13} /> Metode Bayar
                </span>
                <Badge variant="neutral" size="sm" className="font-mono">
                  {paymentMethod.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--tf-bg-subtle)]">
                <span className="text-[var(--tf-text-muted)] flex items-center gap-1.5">
                  <Calendar size={13} /> Tanggal & Waktu
                </span>
                <span className="font-mono font-medium text-[var(--tf-text-primary)]">
                  {transaction.transactionDate} • {transaction.transactionTime} WIB
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--tf-bg-subtle)]">
                <span className="text-[var(--tf-text-muted)]">Kepemilikan</span>
                <span className="font-bold capitalize text-indigo-600 dark:text-indigo-400">
                  {transaction.workspaceId === 'joint' ? 'Bersama (Fazet)' : transaction.workspaceId}
                </span>
              </div>

              {transaction.notes && (
                <div className="p-3 rounded-xl bg-[var(--tf-bg-subtle)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--tf-text-muted)]">Catatan Tambahan:</span>
                  <p className="text-xs text-[var(--tf-text-primary)] leading-relaxed">{transaction.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl">
            Tutup Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
}
