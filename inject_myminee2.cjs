const fs = require('fs');
let c = fs.readFileSync('src/pages/MyMinee.tsx', 'utf-8');

c = c.replace(/const handleUnlock = async \(\) => \{[\s\S]*?\} finally \{\s*setUnlocking\(false\);\s*\}\s*\};/, 
`const handleUnlock = async () => {
    if (!unlockPassword) {
      setUnlockError('Password wajib diisi.');
      return;
    }
    setUnlocking(true);
    setUnlockError('');
    try {
      const email = user?.email;
      if (!email) throw new Error('Email akun tidak tersedia.');
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: unlockPassword });
      if (reauthError) throw new Error('Password salah.');
      setIsUnlocked(true);
      void load();
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : String(err));
    } finally {
      setUnlocking(false);
    }
  };`
);

// Replace UI inputs
const newUI = `              <div className="p-6 space-y-4">
                {unlockError && (
                  <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                    {unlockError}
                  </div>
                )}
                
                {isFathur && accessStatus === 'pending' && (
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 mb-4 dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 font-medium">Mazet meminta akses untuk membuka galeri ini.</p>
                    <Button onClick={handleApproveAccess} disabled={unlocking} variant="primary" className="w-full bg-amber-500 hover:bg-amber-600 text-white">Setujui Akses</Button>
                  </div>
                )}

                {accessStatus === 'none' && !isFathur ? (
                  <>
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Kamu belum memiliki akses ke brankas ini.</p>
                    <Button onClick={handleRequestAccess} disabled={unlocking} className="w-full mt-2" variant="primary">
                      {unlocking ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
                      Minta Akses ke Admin
                    </Button>
                  </>
                ) : accessStatus === 'pending' && !isFathur ? (
                  <div className="text-center p-4">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Menunggu Persetujuan Admin...</p>
                    <p className="text-xs text-slate-500 mt-2">Fathur belum menyetujui permintaanmu. Mohon tunggu.</p>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                      Masukkan Sandi Akun Anda
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        className="input mt-2 h-11 w-full px-3"
                        placeholder="Ketik sandi..."
                      />
                    </label>

                    <Button onClick={handleUnlock} className="mt-2 w-full" variant="primary" disabled={unlocking || !unlockPassword}>
                      {unlocking ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
                      Buka Brankas
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
`;

c = c.replace(/<div className="p-6 space-y-4">[\s\S]*?<\/Card>\s*<\/div>\s*\)\}/, newUI);

// remove unlockToken state
c = c.replace(/const \[unlockToken, setUnlockToken\] = useState\(''\);\n/, '');

fs.writeFileSync('src/pages/MyMinee.tsx', c);
