import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Input,
  Badge,
  Switch,
} from '@schoolhub/ui';
import {
  Key,
  ShieldAlert,
  Settings2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useWatchParty } from '@/context/WatchPartyContext';
import {
  loadKeys,
  loadSearchConfig,
  getMaskedKey,
  resetDailyUsageIfNeeded,
  SearchConfig,
} from '@/lib/apiKeyStore';
import { ApiKeyRecord } from '@/lib/roomUtils';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

interface TvSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TvSettingsModal: React.FC<TvSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const {
    roomCode,
    roomState,
    handleToggleCountdown,
    handleUpdateSearchSettings,
    handleManageLocalKeys,
    handleClearAllRateLimits,
  } = useWatchParty();

  // API Keys state (Old Multi-Key Rotation System)
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [config, setConfig] = useState<SearchConfig>(loadSearchConfig());
  const [newLabel, setNewLabel] = useState('');
  const [newKeyVal, setNewKeyVal] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Rate limit state
  const [rateLimitCount, setRateLimitCount] = useState<number>(config.rateLimitCount || 10);
  const [rateLimitMinutes, setRateLimitMinutes] = useState<number>(
    Math.round((config.rateLimitWindowMs || 300000) / 60000)
  );
  const [activeLimits, setActiveLimits] = useState<
    Record<string, { count: number; windowStart: number }>
  >({});

  const refreshData = () => {
    resetDailyUsageIfNeeded();
    setKeys(loadKeys());
    const cfg = loadSearchConfig();
    setConfig(cfg);
    setRateLimitCount(cfg.rateLimitCount || 10);
    setRateLimitMinutes(Math.round((cfg.rateLimitWindowMs || 300000) / 60000));
  };

  useEffect(() => {
    if (open) {
      refreshData();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !roomCode) {
      setActiveLimits({});
      return;
    }
    const limitsRef = ref(database, `rooms/${roomCode}/searchRateLimits`);
    onValue(limitsRef, (snap) => {
      setActiveLimits(snap.exists() ? snap.val() : {});
    });
    return () => off(limitsRef);
  }, [open, roomCode]);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyVal.trim()) return;
    await handleManageLocalKeys('add', {
      key: newKeyVal.trim(),
      label: newLabel.trim() || `Key ${keys.length + 1}`,
    });
    setNewLabel('');
    setNewKeyVal('');
    refreshData();
  };

  const handleToggleKey = async (id: string, currentEnabled: boolean) => {
    await handleManageLocalKeys('update', {
      id,
      patch: { enabled: !currentEnabled },
    });
    refreshData();
  };

  const handleDeleteKey = async (id: string) => {
    await handleManageLocalKeys('delete', { id });
    setDeleteConfirmId(null);
    refreshData();
  };

  const handleUpdateConfig = async (partial: Partial<SearchConfig>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    await handleUpdateSearchSettings(partial);
    refreshData();
  };

  const handleSaveRateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateConfig({
      rateLimitCount: Math.max(1, rateLimitCount),
      rateLimitWindowMs: Math.max(1, rateLimitMinutes) * 60000,
    });
  };

  const handleClearLimits = async () => {
    await handleClearAllRateLimits();
    setActiveLimits({});
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const now = Date.now();
  const windowMs = (config.rateLimitWindowMs || 300000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-wider uppercase text-primary">
            <Settings2 className="w-5 h-5" />
            {t('tvSettings.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('tvSettings.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full bg-muted/40 p-1">
            <TabsTrigger value="api-keys" className="text-xs flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              {t('tvSettings.tabApiKeys')}
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('tvSettings.tabRateLimits')}
            </TabsTrigger>
            <TabsTrigger value="room" className="text-xs flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />
              {t('tvSettings.tabRoom')}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: API KEYS (Old Multi-Key Rotation System Active) */}
          <TabsContent value="api-keys" className="space-y-4 pt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t('tvSettings.apiKeysTitle')}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{t('tvSettings.apiKeysDesc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="h-7 px-2 text-xs"
                  title="Refresh Quota Status"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {keys.length === 0 ? (
                <div className="p-4 border border-dashed border-border text-center text-xs text-muted-foreground">
                  {t('tvSettings.noKeys')}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className="p-2.5 bg-muted/20 border border-border flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {k.label}
                          </span>
                          <Badge
                            variant={k.enabled ? 'default' : 'secondary'}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {k.enabled ? 'ACTIVE' : 'DISABLED'}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ({k.usageToday || 0} reqs today)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <code className="text-[11px] font-mono text-muted-foreground">
                            {revealedIds[k.id] ? k.key : getMaskedKey(k.key)}
                          </code>
                          <button
                            type="button"
                            onClick={() => toggleReveal(k.id)}
                            className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                          >
                            {revealedIds[k.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch
                          checked={k.enabled}
                          onCheckedChange={() => handleToggleKey(k.id, k.enabled)}
                        />
                        {deleteConfirmId === k.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteKey(k.id)}
                              className="h-6 px-2 text-[10px]"
                            >
                              {t('tvSettings.confirmDelete')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(null)}
                              className="h-6 px-2 text-[10px]"
                            >
                              {t('tvSettings.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(k.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Key Form */}
            <form onSubmit={handleAddKey} className="p-3 bg-muted/10 border border-border space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    {t('tvSettings.keyLabel')}
                  </label>
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder={t('tvSettings.keyLabelPlaceholder')}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    {t('tvSettings.keyValue')}
                  </label>
                  <Input
                    value={newKeyVal}
                    onChange={(e) => setNewKeyVal(e.target.value)}
                    placeholder={t('tvSettings.keyValuePlaceholder')}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="cyber"
                size="sm"
                className="w-full h-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('tvSettings.addKeyBtn')}
              </Button>
            </form>

            {/* Load Balancing Strategy & Max Results */}
            <div className="p-3 bg-muted/10 border border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {t('tvSettings.strategyTitle')}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={config.strategy === 'roundRobin' ? 'cyber' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateConfig({ strategy: 'roundRobin' })}
                    className="h-7 px-2.5 text-[10px]"
                  >
                    {t('tvSettings.roundRobin')}
                  </Button>
                  <Button
                    type="button"
                    variant={config.strategy === 'leastUsed' ? 'cyber' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateConfig({ strategy: 'leastUsed' })}
                    className="h-7 px-2.5 text-[10px]"
                  >
                    {t('tvSettings.leastUsed')}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {t('tvSettings.maxResults')}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={config.maxResults}
                  onChange={(e) =>
                    handleUpdateConfig({
                      maxResults: Math.max(1, Math.min(25, Number(e.target.value) || 25)),
                    })
                  }
                  className="w-20 h-7 text-xs text-center font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {t('tvSettings.allowHostManagement')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t('tvSettings.allowHostDesc')}
                  </span>
                </div>
                <Switch
                  checked={config.allowHostKeyManagement}
                  onCheckedChange={(checked) =>
                    handleUpdateConfig({ allowHostKeyManagement: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: RATE LIMITS */}
          <TabsContent value="rate-limits" className="space-y-4 pt-3">
            <form onSubmit={handleSaveRateLimit} className="p-3 bg-muted/10 border border-border space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('tvSettings.rateLimitTitle')}
                </h4>
                <p className="text-[11px] text-muted-foreground">{t('tvSettings.rateLimitDesc')}</p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={rateLimitCount}
                  onChange={(e) =>
                    setRateLimitCount(Math.max(1, Number(e.target.value) || 10))
                  }
                  className="w-20 h-8 text-xs font-mono text-center"
                />
                <span className="text-xs text-muted-foreground">{t('tvSettings.searches')}</span>
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  value={rateLimitMinutes}
                  onChange={(e) =>
                    setRateLimitMinutes(Math.max(1, Number(e.target.value) || 5))
                  }
                  className="w-20 h-8 text-xs font-mono text-center"
                />
                <span className="text-xs text-muted-foreground">min</span>
                <Button type="submit" variant="cyber" size="sm" className="ml-auto h-8 text-xs">
                  {t('tvSettings.saveLimitBtn')}
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('tvSettings.activeRateLimits')}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLimits}
                  className="h-7 px-2.5 text-[10px]"
                >
                  {t('tvSettings.clearRateLimits')}
                </Button>
              </div>

              {Object.keys(activeLimits).length === 0 ? (
                <div className="p-4 border border-dashed border-border text-center text-xs text-muted-foreground">
                  {t('tvSettings.noRateLimits')}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {Object.entries(activeLimits).map(([uid, entry]) => {
                    if (now - (entry.windowStart || 0) > windowMs) return null;
                    return (
                      <div
                        key={uid}
                        className="p-2 bg-muted/20 border border-border flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-[11px] truncate max-w-[200px]">
                          UID: {uid}
                        </span>
                        <Badge
                          variant={
                            entry.count >= config.rateLimitCount ? 'destructive' : 'outline'
                          }
                          className="font-mono text-[10px]"
                        >
                          {entry.count} / {config.rateLimitCount}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: ROOM SETTINGS */}
          <TabsContent value="room" className="space-y-4 pt-3">
            <div className="p-4 bg-muted/10 border border-border flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('tvSettings.countdownTitle')}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('tvSettings.countdownDesc')}
                </p>
              </div>
              <Switch
                checked={roomState?.isCountdownEnabled !== false}
                onCheckedChange={() => {
                  if (roomCode) {
                    handleToggleCountdown();
                  }
                }}
                disabled={!roomCode}
              />
            </div>

            <div className="p-4 bg-muted/10 border border-border flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {t('tvSettings.preferMusicVideosTitle')}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('tvSettings.preferMusicVideosDesc')}
                </p>
              </div>
              <Switch
                checked={config.preferMusicVideos !== false}
                onCheckedChange={(checked) =>
                  handleUpdateConfig({ preferMusicVideos: checked })
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
