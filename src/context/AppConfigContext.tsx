import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export type FeatureDef = { id: string; label: string; paths: string[] };

/** Daftar fitur yang bisa dimatikan admin dari aplikasi. */
export const FEATURES: FeatureDef[] = [
  { id: "chat", label: "Chat (Chat)", paths: ["/chat"] },
  { id: "ai", label: "FAZET AI", paths: ["/ai"] },
  { id: "my-minee", label: "My Minee", paths: ["/my-minee"] },
  { id: "schedule", label: "Jadwal Sekolah", paths: ["/schedule"] },
  { id: "tutoring", label: "Jadwal Les", paths: ["/tutoring"] },
  { id: "raport", label: "Nilai Rapot", paths: ["/raport", "/rapor"] },
  { id: "calendar", label: "Academic Timeline", paths: ["/calendar"] },
  { id: "tasks", label: "Tugas", paths: ["/tasks"] },
  { id: "notes", label: "Catatan", paths: ["/notes"] },
  { id: "focus", label: "Focus Mode", paths: ["/focus"] },
  { id: "insights", label: "Insights", paths: ["/insights"] },
  { id: "timebox", label: "TimeBox", paths: ["/timebox"] },
  {
    id: "mediabox",
    label: "MediaBox & Watch Party",
    paths: ["/mediabox", "/watch-party"],
  },
  { id: "search", label: "Pencarian", paths: ["/search"] },
  { id: "notifications", label: "Notifikasi", paths: ["/notifications"] },
  { id: "activity", label: "Aktivitas & Perangkat", paths: ["/activity"] },
];

export type Birthday = {
  key: string;
  name: string;
  month: number;
  day: number;
  label: string;
};
export type DashboardConfig = {
  relationshipStart: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  birthdays: Birthday[];
};

export type AIConfig = { personalityName: string; systemPrompt: string; creativityLevel: number; greetingStyle: 'formal' | 'friendly' | 'romantic' | 'sassy'; };

export const DEFAULT_AI: AIConfig = { personalityName: 'FAZET AI', systemPrompt: 'Kamu adalah FAZET AI, asisten eksklusif dan setia milik Fathur dan Mazet. Tugasmu adalah membantu mereka dalam produktivitas, akademik, dan menjaga momen kebersamaan mereka. Jawablah dengan bahasa Indonesia yang hangat, cerdas, dan suportif.', creativityLevel: 0.7, greetingStyle: 'friendly' };

export type BrandingConfig = {
  appName: string;
  announcement: string;
  announcementVisible: boolean;
  bannerTone?: "info" | "success" | "warning" | "danger";
  maintenance?: boolean;
  maintenanceMessage?: string;
  tagline?: string;
};

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: "FAZET LOPP LOPP",
  announcement: "Selamat datang di pembaruan terbaru aplikasi!",
  announcementVisible: false,
  bannerTone: "info",
  maintenance: false,
  maintenanceMessage: "Aplikasi sedang dalam perawatan. Coba lagi sebentar ya!",
  tagline: "Fathur x Mazet workspace",
};

export const DEFAULT_DASHBOARD: DashboardConfig = {
  relationshipStart: { year: 2026, month: 6, day: 2, hour: 18, minute: 55 },
  birthdays: [
    { key: "fathur", name: "Fathur", month: 4, day: 12, label: "12 April" },
    { key: "mazet", name: "Mazet", month: 6, day: 30, label: "30 Juni" },
  ],
};

type Ctx = {
  disabled: string[];
  dashboard: DashboardConfig;
  branding: BrandingConfig;
  ai: AIConfig;
  isPathEnabled: (path: string) => boolean;
  save: (key: string, value: unknown) => Promise<void>;
  ready: boolean;
};

const AppConfigContext = createContext<Ctx | null>(null);
const CACHE = "fazet_app_config";

function readCache(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(CACHE) || "{}");
  } catch {
    return {};
  }
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Record<string, unknown>>(readCache);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("app_config").select("key,value");
    if (data) {
      const next = Object.fromEntries(
        data.map((r) => [r.key as string, r.value]),
      );
      setConfig(next);
      try {
        localStorage.setItem(CACHE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void load();
    // Perubahan dari admin langsung terlihat di semua perangkat.
    const channel = supabase
      .channel("app_config_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_config" },
        () => {
          void load();
        },
      )
      .subscribe();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      sub.subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const disabled = useMemo(() => {
    const v = config.features as { disabled?: string[] } | undefined;
    return Array.isArray(v?.disabled) ? v!.disabled! : [];
  }, [config]);

  const dashboard = useMemo<DashboardConfig>(
    () => ({
      ...DEFAULT_DASHBOARD,
      ...((config.dashboard as Partial<DashboardConfig>) || {}),
    }),
    [config],
  );

  const branding = useMemo<BrandingConfig>(
    () => ({
      ...DEFAULT_BRANDING,
      ...((config.branding as Partial<BrandingConfig>) || {}),
    }),
    [config],
  );

  const ai = useMemo<AIConfig>(() => ({ ...DEFAULT_AI, ...((config.ai_config as Partial<AIConfig>) || {}) }), [config]);

  const isPathEnabled = useCallback(
    (path: string) => {
      const f = FEATURES.find((x) =>
        x.paths.some((p) => path === p || path.startsWith(`${p}/`)),
      );
      return !f || !disabled.includes(f.id);
    },
    [disabled],
  );

  const save = useCallback(
    async (key: string, value: unknown) => {
      const { error } = await supabase
        .from("app_config")
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: "key" },
        );
      if (error) { console.error(error); return; }
      await load();
    },
    [load],
  );

  const value = useMemo(
    () => ({ disabled, dashboard, branding, ai, isPathEnabled, save, ready }),
    [disabled, dashboard, branding, ai, isPathEnabled, save, ready],
  );
  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error("useAppConfig harus di dalam AppConfigProvider");
  return ctx;
}

