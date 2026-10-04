const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AdminHub.tsx', 'utf8');

const ui = `
          {section === 'ai' && (
            <>
              <Panel title="Karakter & Sifat AI" desc="Atur bagaimana FAZET AI merespon dan berinteraksi dengan kamu dan pengguna lain.">
                <label className="block text-xs font-bold">Nama Panggilan AI
                  <input className={inputCls + ' mt-1'} value={aiCfg?.personalityName || ''} onChange={(e) => setAiCfg({...aiCfg, personalityName: e.target.value})} placeholder="Contoh: FAZET AI" />
                </label>
                <label className="block mt-4 text-xs font-bold">Gaya Sapaan
                  <select className={inputCls + ' mt-1'} value={aiCfg?.greetingStyle || 'friendly'} onChange={(e) => setAiCfg({...aiCfg, greetingStyle: e.target.value as any})}>
                    <option value="friendly">Ramah & Sahabat (Friendly)</option>
                    <option value="formal">Sopan & Formal</option>
                    <option value="romantic">Romantis & Manis</option>
                    <option value="sassy">Sarkas & Gaul (Sassy)</option>
                  </select>
                </label>
                <label className="block mt-4 text-xs font-bold">System Prompt (Instruksi Utama)
                  <textarea rows={4} className={inputCls + ' mt-1'} value={aiCfg?.systemPrompt || ''} onChange={(e) => setAiCfg({...aiCfg, systemPrompt: e.target.value})} placeholder="Kamu adalah asisten Fathur..." />
                </label>
                <label className="block mt-4 text-xs font-bold">Tingkat Kreativitas: {Math.round((aiCfg?.creativityLevel || 0.7) * 100)}%
                  <input type="range" min="0" max="1" step="0.1" className="mt-2 w-full" value={aiCfg?.creativityLevel || 0.7} onChange={(e) => setAiCfg({...aiCfg, creativityLevel: parseFloat(e.target.value)})} />
                </label>
              </Panel>
              <div className="flex justify-end"><SaveBtn busy={busy} onClick={() => void run(() => save('ai_config', aiCfg), 'Pengaturan AI tersimpan')}>Simpan AI</SaveBtn></div>
            </>
          )}

          {section === 'cleanup' && (
            <Panel title="Pembersihan Data" desc="Aksi berbahaya untuk menghapus cache, log lama, atau pesan chat yang sudah usang.">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div>
                    <div className="font-bold">Bersihkan Cache Frontend</div>
                    <div className="text-xs text-slate-500">Hapus LocalStorage dan Reload Halaman</div>
                  </div>
                  <Button variant="ghost" onClick={() => { localStorage.clear(); window.location.reload(); }}>Bersihkan</Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                  <div>
                    <div className="font-bold text-rose-700 dark:text-rose-400">Hapus Chat Lama (> 30 Hari)</div>
                    <div className="text-xs text-rose-600/70 dark:text-rose-400/70">Aksi ini tidak bisa dibatalkan!</div>
                  </div>
                  <Button variant="danger" disabled={busy} onClick={async () => { setBusy(true); await supabase.from('messages').delete().lt('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()); showToast('Chat lama dihapus', true); setBusy(false); }}>Hapus</Button>
                </div>
              </div>
            </Panel>
          )}
`;

c = c.replace(/\{section === 'tools' && \(/, ui + "{section === 'tools' && (");
fs.writeFileSync('src/pages/admin/AdminHub.tsx', c, 'utf8');
