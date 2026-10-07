              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-[var(--tf-text-primary)] sm:text-3xl">{currentTime}</div>
              <div className="mt-1 text-[11px] text-[var(--tf-text-muted)]">{dateLabel}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between border-t border-[var(--tf-border)] p-5 lg:border-l lg:border-t-0">
          <div>
            <div className="studio-eyebrow">Berikutnya</div>
            <div className="mt-3 text-lg font-semibold text-[var(--tf-text-primary)]">{next?.subject || 'Waktu kosong'}</div>
            <div className="mt-1 text-xs text-[var(--tf-text-muted)]">{next ? `${next.startTime}â€”Å“${next.endTime} WIB` : 'Nikmati jeda tanpa agenda.'}</div>
          </div>
          <Button size="sm" variant="soft" className="mt-5 w-full" icon={<Timer size={14} />} onClick={() => window.location.assign('/focus')}>Mulai Focus Mode</Button>
        </div>
      </div>
    </Card>
  );

  const StatStrip = () => (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        { to: '/tasks', icon: ListTodo, value: stats.active, label: 'Tugas aktif' },
        { to: '/tasks', icon: AlertTriangle, value: stats.overdue, label: 'Terlambat', danger: stats.overdue > 0 },
        { to: '/insights', icon: CheckCircle2, value: stats.done, label: 'Selesai' },
        { to: '/focus', icon: Flame, value: streak.currentStreak, label: `Streak Â· ${streak.todayMinutes}m` },
      ].map(({ to, icon: Icon, value, label, danger }) => (
        <Link key={label} to={to} className="studio-card group flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--tf-radius-md)] ${danger ? 'bg-[var(--tf-danger-bg)] text-[var(--tf-danger)]' : 'bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]'}`}><Icon size={17} /></div>
          <div className="min-w-0"><div className="text-xl font-bold tabular-nums text-[var(--tf-text-primary)]">{value}</div><div className="truncate text-[11px] text-[var(--tf-text-muted)]">{label}</div></div>
          <ChevronRight className="ml-auto shrink-0 text-[var(--tf-text-muted)] transition-transform group-hover:translate-x-0.5" size={15} />
        </Link>
      ))}
    </div>
  );

  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        ['/raport', 'Nilai Rapot', Award], ['/notes', 'Catatan', StickyNote], ['/focus', 'Focus Mode', Timer], ['/timebox', 'TimeBox', Clock3],
        ['/mediabox', 'MediaBox', Tv], ['/ai', 'FAZET AI', Sparkles], ['/chat', 'Chat', MessageCircle], ['/search', 'Cari', Search],
      ].map(([to, label, Icon]) => <Link key={to as string} to={to as string} className="studio-card group flex min-h-[72px] items-center gap-3 p-3.5 hover:-translate-y-0.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] group-hover:text-[var(--tf-primary)]"><Icon size={17} /></span><span className="text-xs font-semibold text-[var(--tf-text-primary)]">{label as string}</span></Link>)}</div>
  );

  const AgendaCard = () => (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-3"><div><div className="studio-eyebrow"><CalendarClock size={13} /> Agenda hari ini</div><h2 className="mt-1 text-lg font-semibold">Jadwal berjalan</h2></div><Badge variant="neutral">{todayTimeline.length} item</Badge></div>
      <div className="mt-4 space-y-2.5">{scheduleLoading ? <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Memuat agenda...</div> : todayTimeline.length ? todayTimeline.slice(0, 6).map((item, index) => <div key={`${item.id}-${index}`} className="flex items-start gap-3 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)]/65 p-3"><span className={`mt-1 h-9 w-1.5 shrink-0 rounded-full ${index === 0 ? 'bg-[var(--tf-primary)]' : 'bg-[var(--tf-border)]'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[var(--tf-text-primary)]">{item.startTime}</span>{index === 0 && <Badge variant="success" size="sm">Berikutnya</Badge>}</div><div className="mt-1 truncate text-xs font-semibold text-[var(--tf-text-primary)]">{item.subject}</div><div className="mt-0.5 truncate text-[11px] text-[var(--tf-text-muted)]">{item.subject} Â· {item.teacher || item.location || 'Agenda sekolah'}</div></div><span className="text-[10px] text-[var(--tf-text-muted)]">{item.endTime}</span></div>) : <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Tidak ada agenda untuk hari ini.</div>}</div>
    </Card>
  );

  const TaskCard = () => (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tf-border)] pb-3"><div><div className="studio-eyebrow"><ListTodo size={13} /> Fokus tugas</div><h2 className="mt-1 text-lg font-semibold">Prioritas berikutnya</h2></div><Button size="sm" variant="ghost" onClick={() => setTaskOpen(true)}>Tambah</Button></div>
      <div className="mt-4 space-y-2.5">{tasksLoading ? <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Memuat tugas...</div> : visibleTasks.length ? visibleTasks.map((task) => <Link key={task.id} to="/tasks" className="group flex items-center gap-3 rounded-[var(--tf-radius-md)] border border-[var(--tf-border)] p-3 transition hover:bg-[var(--tf-bg-subtle)]"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]"><CheckCircle2 size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[var(--tf-text-primary)]">{task.title}</span><span className="mt-0.5 block text-[10px] text-[var(--tf-text-muted)]">{task.dueDate}{task.dueTime ? ` Â· ${task.dueTime}` : ''}</span></span><ChevronRight size={14} className="text-[var(--tf-text-muted)] transition-transform group-hover:translate-x-0.5" /></Link>) : <div className="py-8 text-center text-xs text-[var(--tf-text-muted)]">Tidak ada tugas aktif. Nikmati ruang kosongmu.</div>}</div>
    </Card>
  );

  const DuoSummary = () => <div className="grid gap-4 md:grid-cols-3"><Card interactive className="p-5"><div className="studio-eyebrow"><GraduationCap size={13} /> Fathur</div><div className="mt-2 text-xl font-semibold">Fokus akademik</div><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Jadwal, tugas, dan sesi belajar tetap terlihat.</p></Card><Card interactive className="p-5"><div className="studio-eyebrow"><Heart size={13} /> Bersama</div><div className="mt-2 text-xl font-semibold">Chat</div><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Chat, My Minee, dan milestone hubungan dalam satu tempat.</p></Card><Card interactive className="p-5"><div className="studio-eyebrow"><GraduationCap size={13} /> Mazet</div><div className="mt-2 text-xl font-semibold">Ruang akademik</div><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Agenda dan progres bisa berkembang sendiri.</p></Card></div>;

  const RomanticHero = () => (
    <Card interactive className="overflow-hidden p-0 romantic-hero">
      <div className="romantic-hero__glow" />
      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="p-6 sm:p-8">
          <div className="studio-eyebrow"><CalendarHeart size={14} /> Perjalanan kita</div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="romantic-avatar romantic-avatar--fathur">F</div>
            <Heart size={20} className="romantic-heart" fill="currentColor" />
            <div className="romantic-avatar romantic-avatar--mazet">M</div>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Fathur <span className="romantic-script">&</span> Mazet</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--tf-text-muted)]">Kita mulai pada <strong className="text-[var(--tf-text-primary)]">{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())} WIB</strong>. Dashboard ini menghitung perjalanan sejak momen itu dan terus menuju anniversary berikutnya.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-lg">
            <div className="romantic-stat"><strong>{relationshipElapsed.days}</strong><span>hari</span></div>
            <div className="romantic-stat"><strong>{two(relationshipElapsed.hours)}</strong><span>jam</span></div>
            <div className="romantic-stat"><strong>{two(relationshipElapsed.minutes)}</strong><span>menit</span></div>
          </div>
        </div>
        <div className="relative border-t border-[var(--tf-border)] p-6 lg:border-l lg:border-t-0 lg:p-7">
          <div className="studio-eyebrow"><Heart size={13} /> Menuju anniversary</div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            <div className="romantic-countdown"><strong>{anniversaryCountdown.days}</strong><span>hari</span></div>
            <div className="romantic-countdown"><strong>{two(anniversaryCountdown.hours)}</strong><span>jam</span></div>
            <div className="romantic-countdown"><strong>{two(anniversaryCountdown.minutes)}</strong><span>menit</span></div>
            <div className="romantic-countdown"><strong>{two(anniversaryCountdown.seconds)}</strong><span>detik</span></div>
          </div>
          <div className="mt-4 rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] p-3 text-[11px] leading-5 text-[var(--tf-primary)]"><strong>2 Juni {relationshipAnniversary.getFullYear()}</strong> Â· 18:55 WIB Â· satu tahun perjalanan berikutnya.</div>
        </div>
      </div>
    </Card>
  );

  const BirthdayCountdownCard = ({ name, label, target, countdown }: { name: string; label: string; target: Date; countdown: ReturnType<typeof countdownParts> }) => (
    <Card interactive className="romantic-birthday-card h-full p-5">
      <div className="flex items-center justify-between gap-3"><div className="studio-eyebrow"><Cake size={13} /> Ulang tahun</div><Badge variant="neutral">{target.getFullYear()}</Badge></div>
      <div className="mt-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">{name}</h2><p className="mt-1 text-xs text-[var(--tf-text-muted)]">{label}</p></div><div className="romantic-birthday-chip">{countdown.days}<span>hari</span></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(countdown.hours)}</strong><span>jam</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(countdown.minutes)}</strong><span>menit</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(countdown.seconds)}</strong><span>detik</span></div></div>
    </Card>
  );

  const RomanticView = () => <div className="dashboard-layout-romantic">
    {RomanticHero()}
    <div className="grid gap-4 md:grid-cols-2">
      {birthdayCountdowns.map((birthday) => <Fragment key={birthday.key}>{BirthdayCountdownCard({ name: birthday.name, label: birthday.label, target: birthday.target, countdown: birthday.countdown })}</Fragment>)}
    </div>
    <div className="grid gap-4">
      <Card interactive className="p-5">
        <div className="studio-eyebrow"><CalendarHeart size={13} /> Tanggal penting</div>
        <div className="mt-4 space-y-3">
          <div className="romantic-date-row"><span>Hubungan</span><strong>{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} â€”  {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())}</strong></div>
          {BIRTHDAYS.map(b => <div key={b.key} className="romantic-date-row"><span>Ulang tahun {b.name}</span><strong>{b.label}</strong></div>)}
        </div>
        <Link to="/calendar" className="studio-action studio-action--soft mt-5 w-full">Buka Academic Timeline</Link>
      </Card>
    </div>
  </div>;

  const TimelineView = () => {
    const currentMinutes = Number(currentTime.slice(0, 2)) * 60 + Number(currentTime.slice(3, 5));
    return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card interactive className="p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-[var(--tf-border)] pb-4"><div><div className="studio-eyebrow"><Layers3 size={13} /> Timeline vertikal</div><h2 className="mt-1 text-lg font-semibold">Satu hari utuh</h2></div><Badge variant="primary"><Clock3 size={13} /> {currentTime}</Badge></div>
        <div className="relative mt-6 space-y-5 pl-10"><div className="absolute bottom-1 left-4 top-1 w-px bg-[var(--tf-border)]" />{todayTimeline.map((item, index) => { const at = minutes(item.startTime); const isNow = Math.abs(currentMinutes - at) <= 45; const past = currentMinutes > at + 60; return <div key={`${item.id}-${index}`} className="relative"><span className={`absolute -left-[31px] top-3 h-4 w-4 rounded-full border-4 ${isNow ? 'border-[var(--tf-primary-subtle)] bg-[var(--tf-primary)] shadow-[0_0_0_2px_var(--tf-primary)]' : past ? 'bg-[var(--tf-text-muted)]' : 'bg-[var(--tf-bg-surface)]'}`} style={!past && !isNow ? { boxShadow: '0 0 0 2px var(--tf-primary)' } : undefined} /><div className={`rounded-[var(--tf-radius-md)] border p-3.5 ${isNow ? 'border-[var(--tf-primary)] bg-[var(--tf-primary-subtle)]/55' : past ? 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/45 opacity-80' : 'border-[var(--tf-border)] bg-[var(--tf-bg-surface)]'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold">{item.startTime}</span>{isNow && <Badge variant="primary" size="sm">Sekarang</Badge>}</div><div className="mt-1 text-sm font-semibold truncate">{item.subject}</div><div className="mt-0.5 text-xs text-[var(--tf-text-muted)] truncate">{item.teacher || item.location || item.subject}</div></div><span className="text-[10px] text-[var(--tf-text-muted)]">{item.endTime}</span></div></div></div>})}</div>
      </Card>
      <div className="space-y-4"><Card interactive className="p-5"><div className="studio-eyebrow"><Flame size={13} /> Streak</div><div className="mt-2 text-4xl font-bold tabular-nums">{streak.currentStreak}</div><div className="mt-1 text-xs text-[var(--tf-text-muted)]">hari fokus berturut-turut Â· {streak.todayMinutes} menit hari ini</div><Link to="/focus" className="studio-action mt-4 w-full">Mulai sesi fokus</Link></Card><Card interactive className="p-5"><div className="studio-eyebrow"><CalendarDays size={13} /> Besok</div><div className="mt-3 flex flex-wrap gap-2">{tomorrowSubjects.length ? tomorrowSubjects.map((subject) => <Badge key={subject} variant="neutral">{subject}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Tidak ada pelajaran tercatat untuk {tomorrowDay}.</span>}</div></Card></div>
    </div>;
  };

  const BentoView = () => <div className="dashboard-layout-bento">
    <div className="bento-span-8">{ClockHero()}</div>
    <div className="bento-span-4"><Card interactive className="h-full p-5"><div className="studio-eyebrow"><Flame size={13} /> Fokus</div><div className="mt-2 text-4xl font-bold">{streak.currentStreak}</div><p className="mt-1 text-xs text-[var(--tf-text-muted)]">Hari berturut-turut Â· {streak.todayMinutes} menit hari ini</p><Link to="/focus" className="studio-action mt-5 w-full">Fokus sekarang</Link></Card></div>
    <div className="bento-span-12">{StatStrip()}</div>
    <div className="bento-span-6">{AgendaCard()}</div>
    <div className="bento-span-6">{TaskCard()}</div>
    <div className="bento-span-4"><Card interactive className="h-full p-5"><div className="studio-eyebrow"><GraduationCap size={13} /> Jadwal les</div><h2 className="mt-1 text-lg font-semibold">Les berikutnya</h2><div className="mt-4 flex items-center gap-3 rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="grid h-10 w-10 place-items-center rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] text-[var(--tf-primary)]"><BookOpen size={18} /></div><div className="min-w-0"><div className="truncate text-sm font-semibold">{workspaceId === 'fathur' ? nextTutoring?.subjectName || 'Belum ada sesi terdekat' : 'Jadwal les Mazet belum diisi.'}</div><div className="mt-0.5 text-[11px] text-[var(--tf-text-muted)]">{nextTutoring ? `${nextTutoring.scheduleDate} Â· ${nextTutoring.startTimeLabel}` : tutoring.error || 'Data les akan muncul saat tersedia.'}</div></div></div></Card></div>
    <div className="bento-span-4"><Card interactive className="h-full p-5"><div className="studio-eyebrow"><CalendarDays size={13} /> Besok</div><h3 className="mt-1 text-lg font-semibold">{tomorrowDay}</h3><div className="mt-4 flex flex-wrap gap-2">{tomorrowSubjects.length ? tomorrowSubjects.map((s) => <Badge key={s} variant="neutral">{s}</Badge>) : <span className="text-xs text-[var(--tf-text-muted)]">Kosong.</span>}</div></Card></div>
    
    <div className="bento-span-6"><DigitalIdCardBanner /></div>
    <div className="bento-span-6"><AiPulseCard tomorrowSubjects={tomorrowSubjects} tomorrowDay={tomorrowDay} academicTimeline={todayTimeline} tutoring={tutoring.items} /></div>
    <div className="bento-span-6"><Card interactive className="h-full p-5"><div className="studio-eyebrow"><BarChart3 size={13} /> Insight</div><h2 className="mt-1 text-lg font-semibold">Progress hari ini</h2><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{stats.active}</div><div className="text-[10px] text-[var(--tf-text-muted)]">aktif</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{stats.done}</div><div className="text-[10px] text-[var(--tf-text-muted)]">selesai</div></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-3"><div className="text-2xl font-bold">{streak.todayMinutes}m</div><div className="text-[10px] text-[var(--tf-text-muted)]">fokus</div></div></div></Card></div>
    
    <div className="bento-span-12">{QuickActions()}</div>
  </div>;

  return (
    <div className="studio-page space-y-5 fade-up" data-dashboard-layout={layout}>
      <div className="flex flex-col gap-3 border-b border-[var(--tf-border)] pb-3 md:flex-row md:items-center md:justify-between">
        <div><div className="studio-eyebrow"><Sparkles size={13} /> FAZET Studio</div><div className="mt-1 flex items-center gap-2"><h2 className="studio-page-title !text-xl sm:!text-2xl">Dashboard</h2><Badge variant="primary" size="sm">{layout === 'focus' ? 'romantis' : layout}</Badge></div></div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-1">
          {LAYOUTS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeLayout(id)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${layout === id ? 'bg-[var(--tf-primary)] text-white' : 'text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-subtle)]'}`}><Icon size={13} />{label}</button>)}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <CountdownTKA />
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--tf-text-secondary)]">Jadwal Sholat & Waktu Beribadah</h3>
          <JadwalSholat />
        </div>
      </div>

      {layout === 'focus' && RomanticView()}
      {layout === 'bento' && BentoView()}
      {layout === 'timeline' && TimelineView()}
      {layout === 'duo' && <div className="space-y-5">{ClockHero()}{StatStrip()}{DuoSummary()}<div className="grid gap-4 lg:grid-cols-2">{AgendaCard()}{TaskCard()}</div><div className="grid gap-4 md:grid-cols-2"><DigitalIdCardBanner /></div>{QuickActions()}</div>}

      <div className="mb-8">
        <MineePreviewCard />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 text-[11px] text-[var(--tf-text-muted)]"><span>{layout === 'focus' ? 'Fathur â†” Mazet Â· perjalanan kita' : `${workspace.name} workspace Â· siap untuk dijalani`}</span><Link to="/settings" className="inline-flex items-center gap-1 font-semibold text-[var(--tf-primary)]">Atur tampilan <ArrowRight size={13} /></Link></div>
