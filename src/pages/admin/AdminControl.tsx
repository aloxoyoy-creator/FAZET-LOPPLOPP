import { useCallback, useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import {
  FEATURES,
  useAppConfig,
  type Birthday,
} from "../../context/AppConfigContext";

type SecretRow = {
  name: string;
  enabled: boolean;
  hint: string;
  updated_at: string;
};
const PRESET_KEYS = [
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "OPENROUTER_API_KEY",
  "DEEPSEEK_API_KEY",
  "YOUTUBE_API_KEY",
];

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-semibold">{label}</span>
      <button
        type="button"
        aria-pressed={on}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
        />
      </button>
    </label>
  );
}

const input =
  "w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm";

export default function AdminControl() {
  const { disabled, dashboard, branding, save } = useAppConfig();
  const [msg, setMsg] = useState("");
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };
  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      flash(ok);
    } catch (e) {
      flash(`Gagal: ${(e as Error).message}`);
    }
  };

  // --- Fitur ---
  const toggleFeature = (id: string, enabled: boolean) =>
    run(
      () =>
        save("features", {
          disabled: enabled
            ? disabled.filter((d) => d !== id)
            : [...new Set([...disabled, id])],
        }),
      enabled ? "Fitur diaktifkan" : "Fitur dinonaktifkan",
    );

  // --- Data dashboard ---
  const [start, setStart] = useState(dashboard.relationshipStart);
  const [birthdays, setBirthdays] = useState<Birthday[]>(dashboard.birthdays);
  useEffect(() => {
    setStart(dashboard.relationshipStart);
    setBirthdays(dashboard.birthdays);
  }, [dashboard]);
  const num = (v: string) => Number(v) || 0;

  // --- Branding ---
  const [br, setBr] = useState(branding);
  useEffect(() => {
    setBr(branding);
  }, [branding]);

  // --- API key ---
  const [secrets, setSecrets] = useState<SecretRow[]>([]);
  const [name, setName] = useState(PRESET_KEYS[0]);
  const [value, setValue] = useState("");
  const loadSecrets = useCallback(async () => {
    const { data } = await supabase.rpc("admin_list_secrets");
    setSecrets((data as SecretRow[]) || []);
  }, []);
  useEffect(() => {
    void loadSecrets();
  }, [loadSecrets]);

  const saveSecret = () =>
    run(async () => {
      const clean = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_");
      if (!clean || !value.trim())
        throw new Error("Nama dan nilai wajib diisi");
      const { error } = await supabase
        .from("app_secrets")
        .upsert(
          {
            name: clean,
            value: value.trim(),
            enabled: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "name" },
        );
      if (error) throw new Error(error.message);
      setValue("");
      await loadSecrets();
    }, "API key tersimpan");
  const toggleSecret = (n: string, enabled: boolean) =>
    run(async () => {
      const { error } = await supabase
        .from("app_secrets")
        .update({ enabled })
        .eq("name", n);
      if (error) throw new Error(error.message);
      await loadSecrets();
    }, "Status key diubah");
  const deleteSecret = (n: string) => {
    if (!confirm(`Hapus ${n}?`)) return;
    void run(async () => {
      const { error } = await supabase
        .from("app_secrets")
        .delete()
        .eq("name", n);
      if (error) throw new Error(error.message);
      await loadSecrets();
    }, "Key dihapus");
  };

  return (
    <div className="space-y-5 fade-up">
      <AdminHeader
        title="Kontrol Aplikasi"
        description="Ubah fitur, data penting, dan API key langsung dari aplikasi — tanpa coding."
      />
      {msg && (
        <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {msg}
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-bold">Teks & Branding</h2>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-semibold">
            Nama Aplikasi
            <input
              className={input + " mt-1"}
              value={br.appName}
              onChange={(e) => setBr({ ...br, appName: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold">
            Pesan Banner (Opsional)
            <input
              className={input + " mt-1"}
              value={br.announcement}
              onChange={(e) => setBr({ ...br, announcement: e.target.value })}
            />
          </label>
          <Switch
            label="Tampilkan Banner"
            on={br.announcementVisible}
            onChange={(v) => setBr({ ...br, announcementVisible: v })}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              void run(() => save("branding", br), "Branding disimpan")
            }
          >
            Simpan Branding
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">Fitur aktif / nonaktif</h2>
        <p className="mt-1 text-xs text-slate-500">
          Fitur yang dimatikan hilang dari menu dan halamannya terkunci untuk
          semua pengguna.
        </p>
        <div className="mt-3 divide-y divide-slate-100">
          {FEATURES.map((f) => (
            <Switch
              key={f.id}
              label={f.label}
              on={!disabled.includes(f.id)}
              onChange={(v) => void toggleFeature(f.id, v)}
            />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">Data dashboard</h2>
        <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
          {(["year", "month", "day", "hour", "minute"] as const).map((k) => (
            <label key={k}>
              {k}
              <input
                className={input}
                type="number"
                value={start[k]}
                onChange={(e) =>
                  setStart({ ...start, [k]: num(e.target.value) })
                }
              />
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Tanggal & jam mulai hubungan (WIB).
        </p>
        <div className="mt-4 space-y-2">
          {birthdays.map((b, i) => (
            <div
              key={b.key}
              className="grid grid-cols-[1fr_70px_70px_auto] gap-2 text-xs"
            >
              <input
                className={input}
                value={b.name}
                onChange={(e) =>
                  setBirthdays(
                    birthdays.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
              <input
                className={input}
                type="number"
                min={1}
                max={12}
                value={b.month}
                onChange={(e) =>
                  setBirthdays(
                    birthdays.map((x, j) =>
                      j === i ? { ...x, month: num(e.target.value) } : x,
                    ),
                  )
                }
              />
              <input
                className={input}
                type="number"
                min={1}
                max={31}
                value={b.day}
                onChange={(e) =>
                  setBirthdays(
                    birthdays.map((x, j) =>
                      j === i ? { ...x, day: num(e.target.value) } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="text-rose-600"
                onClick={() =>
                  setBirthdays(birthdays.filter((_, j) => j !== i))
                }
              >
                Hapus
              </button>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setBirthdays([
                ...birthdays,
                {
                  key: `b${Date.now()}`,
                  name: "Nama",
                  month: 1,
                  day: 1,
                  label: "",
                },
              ])
            }
          >
            + Tambah ulang tahun
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() =>
              void run(
                () =>
                  save("dashboard", {
                    relationshipStart: start,
                    birthdays: birthdays.map((b) => ({
                      ...b,
                      label: `${b.day} ${["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][b.month - 1] ?? ""}`,
                    })),
                  }),
                "Data dashboard tersimpan",
              )
            }
          >
            Simpan data dashboard
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">API Key</h2>
        <p className="mt-1 text-xs text-slate-500">
          Disimpan di server dan tidak bisa dibaca kembali — hanya 4 karakter
          terakhir yang tampil. Dipakai FAZET AI.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[200px_1fr_auto]">
          <input
            className={input}
            list="key-presets"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <datalist id="key-presets">
            {PRESET_KEYS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
          <input
            className={input}
            type="password"
            autoComplete="off"
            placeholder="Tempel API key"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={() => void saveSecret()}>Simpan</Button>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {secrets.length === 0 && (
            <div className="py-3 text-xs text-slate-500">
              Belum ada key tersimpan.
            </div>
          )}
          {secrets.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div>
                <div className="font-mono text-xs font-bold">{s.name}</div>
                <div className="font-mono text-[11px] text-slate-500">
                  {s.hint}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  label=""
                  on={s.enabled}
                  onChange={(v) => void toggleSecret(s.name, v)}
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-rose-600"
                  onClick={() => deleteSecret(s.name)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
