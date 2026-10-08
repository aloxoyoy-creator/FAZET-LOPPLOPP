import { ShieldAlert, Check, X, Loader2, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function AdminToken() {
  const [status, setStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase.from('app_config').select('value').eq('key', 'myminee_access_mazet').single().then(({data}) => {
      if (data?.value?.status) {
        setStatus(data.value.status);
      }
      setLoading(false);
    });
  }, []);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await supabase.from('app_config').upsert({ key: 'myminee_access_mazet', value: { status: 'approved', approvedAt: Date.now() }, updated_at: new Date().toISOString() });
      
      const { data: mazetData } = await supabase.from('profiles').select('uid').eq('workspace_id', 'mazet').single();
      if (mazetData?.uid) {
        await supabase.from('notifications').insert({
          user_id: mazetData.uid,
          title: 'Akses My Minee Disetujui',
          message: 'Fathur telah menyetujui akses kamu ke My Minee!',
          type: 'achievement',
          read: false
        });
      }
      setStatus('approved');
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  const handleRevoke = async () => {
    setProcessing(true);
    try {
      await supabase.from('app_config').upsert({ key: 'myminee_access_mazet', value: { status: 'none' }, updated_at: new Date().toISOString() });
      setStatus('none');
    } catch (e) {
      console.error(e);
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Persetujuan Akses</h1>
        <p className="text-sm text-slate-500">
          Kelola permintaan akses masuk ke brankas My Minee.
        </p>
      </div>

      <Card className="max-w-2xl overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Akses Brankas: Mazet</h2>
              <p className="text-xs font-semibold text-slate-500">Kontrol apakah Mazet dapat membuka My Minee.</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          
          {loading ? (
            <div className="py-10 text-center flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : status === 'pending' ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
              <ShieldAlert size={32} className="mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Permintaan Akses Baru!</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">Mazet sedang meminta izin untuk membuka galeri My Minee. Apakah Anda ingin menyetujuinya?</p>
              
              <div className="flex justify-center gap-3">
                <Button variant="outline" disabled={processing} onClick={handleRevoke} className="bg-white hover:bg-red-50 text-red-600 border-red-200">
                  <X size={16} /> Tolak
                </Button>
                <Button variant="primary" disabled={processing} onClick={handleApprove} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Setujui Akses
                </Button>
              </div>
            </div>
          ) : status === 'approved' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Check size={32} />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-2">Akses Terbuka</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6 max-w-md mx-auto">Mazet memiliki akses penuh untuk masuk ke My Minee kapan saja.</p>
              
              <Button variant="outline" disabled={processing} onClick={handleRevoke} className="bg-white hover:bg-red-50 text-red-600 border-red-200 mx-auto">
                {processing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Cabut Akses
              </Button>
            </div>
          ) : (
             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Akses Terkunci</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Belum ada permintaan akses. Mazet tidak dapat membuka galeri saat ini.</p>
              
              <Button variant="primary" disabled={processing} onClick={handleApprove} className="mx-auto">
                {processing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Buka Akses Sekarang (Tanpa Request)
              </Button>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
