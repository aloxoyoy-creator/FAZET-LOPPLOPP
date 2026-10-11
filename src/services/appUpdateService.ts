export interface VersionInfo {
  version: string;
  buildTime: string;
  environment?: string;
}

const CURRENT_VERSION_KEY = 'fazet_app_version';
const LAST_UPDATE_KEY = 'fazet_last_updated_at';

export async function checkForUpdate(): Promise<{ hasUpdate: boolean; newVersion?: VersionInfo }> {
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) return { hasUpdate: false };

    const data: VersionInfo = await res.json();
    const localVersion = localStorage.getItem(CURRENT_VERSION_KEY);

    if (!localVersion) {
      localStorage.setItem(CURRENT_VERSION_KEY, data.buildTime || data.version);
      return { hasUpdate: false };
    }

    if (data.buildTime && localVersion !== data.buildTime) {
      return { hasUpdate: true, newVersion: data };
    }

    return { hasUpdate: false };
  } catch (err) {
    console.warn('[AutoUpdate] Check failed:', err);
    return { hasUpdate: false };
  }
}

export async function forceUpdateApp(onProgress?: (message: string) => void): Promise<void> {
  try {
    onProgress?.('Membersihkan service worker & cache...');

    // 1. Post message to Service Worker to clear cache
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_CACHE' });
          reg.active.postMessage({ type: 'SKIP_WAITING' });
        }
        await reg.unregister();
      }
    }

    // 2. Clear all browser CacheStorage
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    onProgress?.('Memperbarui data versi...');

    // 3. Clear transient storage
    sessionStorage.clear();
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());

    // Try fetching the latest version.json to sync version key
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const v: VersionInfo = await res.json();
        localStorage.setItem(CURRENT_VERSION_KEY, v.buildTime || v.version);
      }
    } catch {
      // ignore
    }

    onProgress?.('Memuat ulang aplikasi versi terbaru...');

    // 4. Force reload with cache-buster parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('reload_v', String(Date.now()));
    window.location.replace(currentUrl.toString());
  } catch (err) {
    console.error('[AutoUpdate] Force update error:', err);
    window.location.reload();
  }
}
