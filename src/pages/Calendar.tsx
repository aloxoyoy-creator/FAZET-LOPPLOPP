import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, UserRound, ChevronLeft, ChevronRight, CircleAlert, Download, GraduationCap, PartyPopper, Sun, Clock, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useTasks } from '../hooks/useTasks';
import { useSchedule } from '../hooks/useSchedule';
import { useGoogleHolidays } from '../hooks/useGoogleHolidays';
import { countdownToSchoolDay, dateKey, isHoliday, isWeekend } from '../lib/schoolCalendar';
import { cn } from '../lib/utils';
import { exportCalendarIcs } from '../lib/ics';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFathurTutoringSchedule } from '../hooks/useFathurTutoringSchedule';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAME: Record<number, string> = { 0: 'Minggu', 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu' };

function calendarCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= days ? new Date(year, month, day) : null;
  });
}

export default function Calendar() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { items: schedule } = useSchedule();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const { events: holidays, byDate: holidayByDate, loading: holidayLoading, error: holidayError } = useGoogleHolidays(cursor);
  
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  
  const { items: tutoring } = useFathurTutoringSchedule(new Date());
  const [focusRows, setFocusRows] = useState<Array<{id:string;task_id:string|null;minutes:number;started_at:string;ended_at:string}>>([]);

  useEffect(() => {
    async function loadFocus() {
      if (!user) return;
      const { data } = await supabase.from('focus_sessions').select('id,task_id,minutes,started_at,ended_at').eq('user_id', user.id).gte('started_at', `${year}-${String(month+1).padStart(2,'0')}-01T00:00:00Z`).lte('started_at', `${year}-${String(month+1).padStart(2,'0')}-31T23:59:59Z`);
      if (data) setFocusRows(data);
    }
    void loadFocus();
  }, [user, year, month]);

  const cells = useMemo(() => calendarCells(year, month), [year, month]);
  const title = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(cursor);
  
  const moveMonth = (delta: number) => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
  };

  const todayKey = dateKey(new Date());
  const taskCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.dueDate) map.set(t.dueDate, (map.get(t.dueDate) || 0) + 1);
    }
    return map;
  }, [tasks]);

  const tasksByDateMap = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      if (t.dueDate) {
        if (!map.has(t.dueDate)) map.set(t.dueDate, []);
        map.get(t.dueDate)!.push(t);
      }
    }
    return map;
  }, [tasks]);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  useEffect(() => {
    const [y, m, d] = selected.split('-').map(Number);
    setSelectedDate(new Date(y, m - 1, d));
  }, [selected]);

  const selectedTasks = tasks.filter((t) => t.dueDate === selected).sort((a,b) => (a.dueTime||'').localeCompare(b.dueTime||''));
  const selectedHoliday = holidayByDate.get(selected) || [];
  const selectedTutoring = tutoring.filter((t) => t.scheduleDate === selected).sort((a,b) => a.startTimeLabel.localeCompare(b.startTimeLabel));
  const selectedFocus = focusRows.filter((r) => r.started_at.startsWith(selected));
  
  const schoolDay = !isWeekend(selected) && selectedHoliday.length === 0;
  const dayName = DAY_NAME[selectedDate.getDay()];
  const selectedSchedule = schedule.filter((s) => s.day === dayName && s.active).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const countdown = countdownToSchoolDay(new Date(), holidayByDate);

  // Helper for timeline rendering
  const isPast = (timeStr: string) => {
    if (selected !== todayKey) return selected < todayKey;
    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
  };

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Timeline</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola jadwal sekolah, tugas, les, dan agenda libur secara terpadu.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => exportCalendarIcs(tasks, schedule, cursor)} className="rounded-xl border-none shadow-none text-slate-600 dark:text-slate-300">
            Export .ICS
          </Button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="focus-ring rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-2 transition-colors text-slate-600 dark:text-slate-300" onClick={() => moveMonth(-1)} aria-label="Bulan sebelumnya">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-[140px] text-center text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            {title}
          </div>
          <button className="focus-ring rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-2 transition-colors text-slate-600 dark:text-slate-300" onClick={() => moveMonth(1)} aria-label="Bulan berikutnya">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Status Akademik</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{countdown.label}</div>
              <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">Sabtu, Minggu dan libur nasional otomatis dilewati.</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex flex-col h-full justify-center relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600">
                <Sun size={20} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Libur Nasional</div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {holidayLoading ? 'Sinkronisasi...' : `${holidays.length} Hari Libur`}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Google Calendar terintegrasi otomatis.
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px] items-start">
        {/* Calendar Grid */}
        <Card className="p-4 md:p-6 shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {WEEKDAYS.map((day) => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="min-h-[100px] md:min-h-[120px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/20" />;
              
              const key = dateKey(cell);
              const isToday = key === todayKey;
              const holiday = isHoliday(key, holidayByDate);
              const weekend = isWeekend(key);
              const dayName = DAY_NAME[cell.getDay()];
              const daySchedule = schedule.filter((item) => item.day === dayName && item.active);
              const hasSchedule = !holiday && !weekend && daySchedule.length > 0;
              const dayTasks = tasksByDateMap.get(key) || [];
              const dayTutoring = tutoring.filter(t => t.scheduleDate === key);

              return (
                <button 
                  key={key} 
                  type="button" 
                  onClick={() => setSelected(key)} 
                  className={cn(
                    'relative flex flex-col min-h-[60px] md:min-h-[130px] rounded-2xl p-2 md:p-3 text-left transition-all border',
                    selected === key 
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' 
                      : weekend 
                        ? 'border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800' 
                        : holiday 
                          ? 'border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20' 
                          : 'border-transparent bg-white dark:bg-[#0f1219] hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                  )}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full text-sm font-black', 
                      isToday 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                        : weekend 
                          ? 'text-slate-400 dark:text-slate-500' 
                          : holiday 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : 'text-slate-700 dark:text-slate-200'
                    )}>
                      {cell.getDate()}
                    </span>
                    
                    {/* Tiny dots indicator for mobile (hidden on md) */}
                    <div className="flex flex-wrap justify-end max-w-[50%] gap-1 md:hidden mt-1">
                      {dayTasks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                      {hasSchedule && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      {holiday && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                      {dayTutoring.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>}
                    </div>
                  </div>

                  {/* Desktop event chips */}
                  <div className="hidden md:flex flex-col gap-1.5 mt-3 overflow-y-auto max-h-[120px] hide-scrollbar w-full">
                    {holiday && (
                      <div className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-normal break-words leading-tight w-full border border-rose-200/50 dark:border-rose-800/50">
                        {String(holidayByDate.get(key)?.[0]?.summary || 'Libur')}
                      </div>
                    )}
                    
                    {!holiday && dayTasks.slice(0,2).map((t, i) => (
                      <div key={i} className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-normal break-words leading-tight w-full border border-blue-200/50 dark:border-blue-800/50 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        {t.title}
                      </div>
                    ))}
                    {!holiday && dayTasks.length > 2 && (
                      <div className="text-[10px] font-bold text-slate-400 pl-1">+{dayTasks.length - 2} tugas lain</div>
                    )}

                    {!holiday && dayTutoring.map((t, i) => (
                      <div key={`tut-${i}`} className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-normal break-words leading-tight w-full border border-violet-200/50 dark:border-violet-800/50">
                        Les: {t.subjectName}
                      </div>
                    ))}

                    {hasSchedule && (
                      <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-normal break-words leading-tight w-full border border-slate-200/50 dark:border-slate-700/50">
                        {daySchedule.length} Mapel
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Sidebar: Detail Hari */}
        <div className="flex flex-col gap-5 sticky top-24">
          <Card className="p-0 overflow-hidden shadow-md shadow-slate-200/20 dark:shadow-none border-slate-200/60 dark:border-slate-800/60">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm">
                  <CalendarDays size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Detail Agenda</h2>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(selectedDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              
              {/* Holidays */}
              {selectedHoliday.length > 0 && (
                <div className="space-y-3">
                  {selectedHoliday.map((holiday) => (
                    <div key={holiday.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-900/20 p-4 border border-rose-100 dark:border-rose-900/50">
                      <PartyPopper size={40} className="absolute -right-2 -bottom-2 text-rose-500/10 dark:text-rose-400/10" />
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-xl text-rose-600 dark:text-rose-400">
                          <PartyPopper size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-1">Hari Libur</div>
                          <div className="text-base font-black text-rose-900 dark:text-rose-100">{String(holiday.summary)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Weekend */}
              {isWeekend(selected) && selectedHoliday.length === 0 && (
                <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl text-amber-600">
                    <Sun size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-amber-900 dark:text-amber-100">Akhir Pekan</div>
                    <div className="text-xs font-medium text-amber-700/70 dark:text-amber-400/70">Selamat beristirahat!</div>
                  </div>
                </div>
              )}

              {/* Tasks (Deadline) */}
              {selectedTasks.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Deadline Tugas</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-3">
                    {selectedTasks.map((task) => (
                      <div key={task.id} className="group relative rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
                        <div className="flex justify-between items-start pl-2">
                          <div>
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{task.subjectName}</div>
                            <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">{task.title}</div>
                          </div>
                          <Badge tone="blue" className="shrink-0">{task.dueTime}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tutoring */}
              {selectedTutoring.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap size={16} className="text-violet-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Jadwal Les</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-3">
                    {selectedTutoring.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-950/20 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                          <div>
                            <div className="text-sm font-black text-violet-900 dark:text-violet-100">{item.subjectName}</div>
                            <div className="text-[11px] font-semibold text-violet-600/70 dark:text-violet-400/70 mt-0.5">{item.activityType} ? {item.className}</div>
                          </div>
                        </div>
                        <div className="text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 px-2 py-1 rounded-lg">
                          {item.startTimeLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* School Schedule (Beautiful Vertical Timeline) */}
              {schoolDay && selectedSchedule.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <BookOpen size={16} className="text-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Jadwal Sekolah</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pb-2">
                    {selectedSchedule.map((item, idx) => {
                      const past = isPast(item.endTime);
                      const isLast = idx === selectedSchedule.length - 1;
                      
                      return (
                        <div key={item.id} className={cn("relative pl-6 transition-opacity", past ? "opacity-50" : "opacity-100")}>
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm z-10",
                            past ? "bg-slate-300 dark:bg-slate-600" : "bg-emerald-500"
                          )}>
                            {past && <CheckCircle2 size={12} className="text-white absolute -inset-[2px]" />}
                          </div>
                          
                          {/* Event content */}
                          <div className={cn(
                            "bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm transition-all hover:shadow-md",
                            past ? "border-slate-100 dark:border-slate-800" : "border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/5"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <div className={cn("text-xs font-black bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg", past ? "text-slate-500" : "text-emerald-600 dark:text-emerald-400")}>
                                {item.startTime} - {item.endTime}
                              </div>
                            </div>
                            <div className="text-base font-black text-slate-900 dark:text-white leading-tight">{item.subject}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                              <UserRound size={12} /> {item.teacher || 'Tidak ada info guru'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {selectedTasks.length === 0 && selectedHoliday.length === 0 && selectedTutoring.length === 0 && (!schoolDay || selectedSchedule.length === 0) && !isWeekend(selected) && (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 text-slate-400">
                    <CalendarDays size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Kosong, nih!</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[200px]">Tidak ada jadwal, les, ataupun deadline tugas hari ini.</p>
                </div>
              )}

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
