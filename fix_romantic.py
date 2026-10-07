# -*- coding: utf-8 -*-

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_str = '{/* 3. ROMANTISS'
end_str = '<TaskForm'

start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = '''{/* 3. ROMANTISS (Perjalanan Kita, Ulang Tahun, My Minee) */}
      {workspaceId === 'fathur' && (
        <div className="space-y-4">
          <div className="dashboard-layout-romantic">
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
                  <div className="mt-4 rounded-[var(--tf-radius-md)] bg-[var(--tf-primary-subtle)] p-3 text-[11px] leading-5 text-[var(--tf-primary)]"><strong>2 Juni {relationshipAnniversary.getFullYear()}</strong> · 18:55 WIB · satu tahun perjalanan berikutnya.</div>
                </div>
              </div>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              {birthdayCountdowns.map((birthday) => (
                <Card interactive key={birthday.key} className="romantic-birthday-card h-full p-5">
                  <div className="flex items-center justify-between gap-3"><div className="studio-eyebrow"><Cake size={13} /> Ulang tahun</div><Badge variant="neutral">{birthday.target.getFullYear()}</Badge></div>
                  <div className="mt-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">{birthday.name}</h2><p className="mt-1 text-xs text-[var(--tf-text-muted)]">{birthday.label}</p></div><div className="romantic-birthday-chip">{birthday.countdown.days}<span>hari</span></div></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.hours)}</strong><span>jam</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.minutes)}</strong><span>menit</span></div><div className="rounded-[var(--tf-radius-md)] bg-[var(--tf-bg-subtle)] p-2"><strong>{two(birthday.countdown.seconds)}</strong><span>detik</span></div></div>
                </Card>
              ))}
            </div>
            
            <div className="grid gap-4">
              <Card interactive className="p-5">
                <div className="studio-eyebrow"><CalendarHeart size={13} /> Tanggal penting</div>
                <div className="mt-4 space-y-3">
                  <div className="romantic-date-row"><span>Hubungan</span><strong>{relationshipStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} —  {two(relationshipStart.getHours())}:{two(relationshipStart.getMinutes())}</strong></div>
                  {BIRTHDAYS.map(b => <div key={b.key} className="romantic-date-row"><span>Ulang tahun {b.name}</span><strong>{b.label}</strong></div>)}
                </div>
                <Link to="/calendar" className="studio-action studio-action--soft mt-5 w-full">Buka Academic Timeline</Link>
              </Card>
            </div>
          </div>
          
          <div className="mb-8">
            <MineePreviewCard />
          </div>
        </div>
      )}

      '''
    new_text = text[:start_idx] + replacement + text[end_idx:]
    with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Successfully restored Romantic layout!")
else:
    print(f"Failed. start_idx: {start_idx}, end_idx: {end_idx}")

