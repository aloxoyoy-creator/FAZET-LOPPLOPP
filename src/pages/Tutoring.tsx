import React, { useState, useMemo } from 'react';
import { CalendarDays, GraduationCap, Sparkles, Clock, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useFathurTutoringSchedule } from '../hooks/useFathurTutoringSchedule';

function prettyDate(value: string) {
  const date = new Date(`${value}T12:00:00+07:00`);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function timeToMinutes(value: string) {
  const match = value.replace('.', ':').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]) * 60 + Number(match[2]);
}

export default function Tutoring() {
  const { workspaceId, workspace } = useWorkspace();
  const [now] = useState(() => new Date());
  
  // Ambil semua data jadwal
  const { items, loading, error, source } = useFathurTutoringSchedule(now);

  // Group jadwal berdasarkan tanggal, lalu filter hanya jadwal hari ini dan ke depan
  const upcomingSchedules = useMemo(() => {
    if (!items || items.length === 0) return [];

    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);

    const filtered = items.filter(i => i.scheduleDate >= todayStr);
    
    // Grouping
    const grouped = filtered.reduce((acc, curr) => {
      if (!acc[curr.scheduleDate]) acc[curr.scheduleDate] = [];
      acc[curr.scheduleDate].push(curr);
      return acc;
    }, {} as Record<string, typeof items>);

    // Sorting
    return Object.keys(grouped).sort().map(date => {
      const dayItems = grouped[date].sort((a, b) => timeToMinutes(a.startTimeLabel) - timeToMinutes(b.startTimeLabel));
      return { date, items: dayItems };
    });
  }, [items, now]);

  if (workspaceId !== 'fathur') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 pb-12 fade-up">
        <header className="fazet-min-card p-6 sm:p-8 bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs tracking-widest uppercase mb-3">
            <GraduationCap size={16} /> Ruang Akademik
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Jadwal Bimbingan Belajar</h1>
          <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
            Halaman ini khusus untuk mengatur jadwal les dan bimbingan belajar tambahan.
          </p>
        </header>
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center py-20">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <CalendarDays size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada jadwal les untuk {workspace.name}</h2>
          <p className="text-slate-500 text-sm max-w-md">Jadwal intensif hanya dikonfigurasi untuk profil siswa tertentu. Tambahkan modul khusus bila Anda ingin mengaktifkannya.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 fade-up font-sans">
      {/* Header Premium */}
      <header className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 sm:p-10 shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-500/10 pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap size={160} />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles size={14} /> Kelas 12B Intensif
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Jadwal Les & <br className="hidden sm:block" /> Tryout Nasional
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
              Akses cepat menuju rutinitas akademik Anda. Data jadwal ini langsung tersinkronisasi dan dipisahkan dari kalender utama agar fokus Anda tetap terjaga.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-emerald-500" /> Agenda Mendatang
              </h2>
              {source && (
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  Sumber Data: {source === 'supabase' ? 'Database Langsung' : 'Jadwal Terintegrasi 05 Okt - 01 Nov'}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Memuat jadwal akademik...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-5 rounded-2xl border border-red-100 dark:border-red-500/20">
              <AlertCircle className="mt-0.5" />
              <div>
                <h3 className="font-bold">Gagal memuat jadwal</h3>
                <p className="text-sm opacity-80 mt-1">{error}</p>
              </div>
            </div>
          ) : upcomingSchedules.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <GraduationCap className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tidak Ada Jadwal Mendatang</h3>
              <p className="text-slate-500 text-sm">Semua jadwal telah selesai atau belum ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {upcomingSchedules.map((group, groupIdx) => (
                <div key={group.date} className="relative">
                  {/* Timeline Line (Hidden on very small screens) */}
                  <div className="hidden sm:block absolute left-4 top-10 bottom-0 w-px bg-slate-100 dark:bg-slate-800 -z-10" />
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 items-center justify-center flex-shrink-0 relative z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 pr-4">
                      {prettyDate(group.date)}
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider">
                      {group.items.length} Sesi
                    </span>
                  </div>

                  <div className="sm:ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="group flex flex-col justify-between bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all" />
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                              {item.activityType}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
                              {item.subjectName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <BookOpen size={14} className="text-slate-400" /> 
                              Kode: {item.subjectCode}
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm">
                              <Clock size={14} className="text-emerald-500" />
                              {item.startTimeLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
