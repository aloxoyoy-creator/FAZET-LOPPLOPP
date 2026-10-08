import { ShieldAlert, KeyRound, Copy, Check, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getAdminToken, getTokenTimeRemaining } from '../../lib/token';

export default function AdminToken() {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(getAdminToken());
  const [timeLeft, setTimeLeft] = useState(getTokenTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTokenTimeRemaining();
      setTimeLeft(remaining);
      setToken(getAdminToken());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Token Akses Admin</h1>
        <p className="text-sm text-slate-500">
          Token ini diperlukan untuk membuka akses ke fitur terenkripsi seperti My Minee.
        </p>
      </div>

      <Card className="max-w-2xl overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Token Keamanan Utama</h2>
              <p className="text-xs font-semibold text-slate-500">Token diperbarui secara otomatis setiap 5 menit.</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="font-mono text-3xl font-black tracking-widest text-slate-900 dark:text-white transition-all">
              {token}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <Clock size={16} />
              Kedaluwarsa dalam {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={copyToClipboard} className="flex-1" variant="primary">
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Tersalin' : 'Salin Token'}
            </Button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200">
              <KeyRound size={18} className="mt-0.5 shrink-0" />
              <div className="text-sm leading-6">
                <strong>Penting:</strong> Token ini memberikan akses ke semua file sensitif dalam My Minee. Jaga kerahasiaan token ini dan jangan bagikan ke siapapun.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
