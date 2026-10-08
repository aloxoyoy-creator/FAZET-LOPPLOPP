import { Info, Calendar, Sparkles, Code2, Heart, Shield, Cpu, RefreshCw, CheckCircle2, Server, Smartphone, Globe, Code } from 'lucide-react';
import Card from '../components/ui/Card';
import { useAppConfig } from '../context/AppConfigContext';

export default function About() {
  const { branding } = useAppConfig();

  // Konfigurasi info aplikasi (dapat diubah nanti oleh Fathur)
  const appInfo = {
    version: '2.0.0 (Total Redesign)',
    firstCreated: '30 September 2026',
    lastUpdated: '8 Oktober 2026, 20:55 WIB',
    developer: 'Aloxoyoy Creator (Fathur)',
    frameworks: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Supabase', 'Framer Motion'],
    codename: 'FAZET LOPLOP V2',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Informasi Sistem</h1>
        <p className="text-sm text-slate-500">
          Detail teknis dan sejarah pembaruan aplikasi {branding.appName}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Info size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Identitas Aplikasi</h2>
                <p className="text-xs font-semibold text-slate-500">Versi & Info Dasar</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-500"><Sparkles size={16} /> Nama Aplikasi</span>
              <strong className="text-sm text-slate-900 dark:text-white">{branding.appName}</strong>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-500"><Code2 size={16} /> Codename</span>
              <strong className="text-sm text-slate-900 dark:text-white">{appInfo.codename}</strong>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 size={16} /> Versi Saat Ini</span>
              <strong className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{appInfo.version}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-slate-500"><Heart size={16} /> Developer</span>
              <strong className="text-sm text-slate-900 dark:text-white">{appInfo.developer}</strong>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Linimasa Waktu</h2>
                <p className="text-xs font-semibold text-slate-500">Sejarah Rilis & Pembaruan</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-500"><Sparkles size={16} /> Dibuat Pertama Kali</span>
              <strong className="text-sm text-slate-900 dark:text-white">{appInfo.firstCreated}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm text-slate-500"><RefreshCw size={16} /> Terakhir Diperbarui</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{appInfo.lastUpdated}</strong>
            </div>
            
            <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Aplikasi ini terus dikembangkan tanpa henti untuk memberikan pengalaman yang sempurna, mengukir cerita baru setiap harinya."
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden md:col-span-2">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Cpu size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Spesifikasi Sistem & Keamanan</h2>
                <p className="text-xs font-semibold text-slate-500">Teknologi di Balik Layar</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Globe size={16} className="text-blue-500" /> Platform
              </div>
              <p className="text-xs text-slate-500">PWA (Progressive Web App) berjalan di iOS, Android, dan Desktop.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Server size={16} className="text-green-500" /> Database & Auth
              </div>
              <p className="text-xs text-slate-500">Supabase (PostgreSQL) dengan enkripsi data End-to-End.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Shield size={16} className="text-rose-500" /> Keamanan My Minee
              </div>
              <p className="text-xs text-slate-500">Sistem persetujuan akses satu arah dengan verifikasi sesi waktu nyata.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Code size={16} className="text-purple-500" /> Tech Stack
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {appInfo.frameworks.map((fw, i) => (
                  <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
