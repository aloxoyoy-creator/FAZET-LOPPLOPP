import React, { useState } from 'react';
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
} from '@schoolhub/ui';
import {
  Search,
  Link2,
  Plus,
  Check,
  Loader2,
  Trash2,
  Play,
  ListMusic,
  Key,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useWatchParty } from '@/context/WatchPartyContext';
import { searchYouTubeVideos, SearchResultItem } from '@/lib/youtube';

export const TvSearchModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    showSearchModal,
    setShowSearchModal,
    setShowSettingsModal,
    queue,
    handleAddUrlHost,
    handlePlayQueueItem,
    handleRemoveQueueItem,
    searchSettings,
  } = useWatchParty();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const [pasteUrl, setPasteUrl] = useState('');
  const [addingPaste, setAddingPaste] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await searchYouTubeVideos(searchQuery.trim());
      if (res.error && res.results.length === 0) {
        setSearchError(res.error);
      }
      setSearchResults(res.results);
    } catch (err: any) {
      setSearchError(err?.message || 'Gagal mencari video YouTube.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddResult = async (item: SearchResultItem) => {
    const keyId = item.id || item.videoId || item.url;
    const ok = await handleAddUrlHost(item.url, item.title);
    if (ok) {
      setAddedIds((prev) => ({ ...prev, [keyId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [keyId]: false }));
      }, 2500);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteUrl.trim() || addingPaste) return;
    setAddingPaste(true);
    try {
      const ok = await handleAddUrlHost(pasteUrl.trim());
      if (ok) {
        setPasteUrl('');
      }
    } finally {
      setAddingPaste(false);
    }
  };

  return (
    <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
      <DialogContent
        className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-wider uppercase text-foreground">
            <Search className="w-5 h-5" />
            {t('watchParty.searchModalTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('watchParty.searchModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full bg-muted/40 p-1">
            <TabsTrigger value="search" className="text-xs flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              {t('remote.searchYoutubeTab')}
            </TabsTrigger>
            <TabsTrigger value="paste" className="text-xs flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              {t('remote.pasteLinkTab')}
            </TabsTrigger>
            <TabsTrigger value="queue" className="text-xs flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5" />
              {t('watchParty.queueBtn')} ({queue.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: KEYWORD SEARCH */}
          <TabsContent value="search" className="space-y-3 pt-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('remote.searchPlaceholder')}
                className="flex-1 h-9 text-xs"
              />
              <Button
                type="submit"
                variant="cyber"
                size="sm"
                disabled={searching || !searchQuery.trim()}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : t('remote.searchBtn')}
              </Button>
            </form>

            {!searchSettings.hasApiKeys && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-2 text-xs">
                <span className="text-amber-300/90 text-[11px]">
                  Tips: Tambahkan API Key YouTube di Pengaturan TV untuk kuota pencarian lokal penuh.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowSettingsModal(true);
                  }}
                  className="h-7 px-2.5 text-[10px] flex items-center gap-1 flex-shrink-0"
                >
                  <Key className="w-3 h-3" />
                  API Key
                </Button>
              </div>
            )}

            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg">
                {searchError}
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {searchResults.map((item) => {
                const keyId = item.id || item.videoId || item.url;
                const isAdded = Boolean(addedIds[keyId]);
                return (
                  <div
                    key={keyId}
                    className="p-2 bg-muted/20 hover:bg-muted/40 border border-border rounded-lg flex items-center gap-3 transition-colors"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-12 object-cover rounded flex-shrink-0 bg-black"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.channelTitle}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isAdded ? 'outline' : 'cyber'}
                      size="sm"
                      onClick={() => handleAddResult(item)}
                      className="h-8 px-3 text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('remote.addedBtn')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('remote.addBtn')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: PASTE DIRECT YOUTUBE LINK */}
          <TabsContent value="paste" className="space-y-3 pt-3">
            <form onSubmit={handlePasteSubmit} className="space-y-2.5">
              <Input
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder={t('remote.pasteUrlPlaceholder')}
                className="h-9 text-xs font-mono"
              />
              <Button
                type="submit"
                variant="cyber"
                disabled={addingPaste || !pasteUrl.trim()}
                className="w-full h-9 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {addingPaste ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t('remote.submitVideoToQueue')}</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 3: CURRENT QUEUE */}
          <TabsContent value="queue" className="space-y-2 pt-3">
            {queue.length === 0 ? (
              <div className="p-6 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground">
                {t('watchParty.queueEmpty')}
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {queue.map((qItem, idx) => (
                  <div
                    key={qItem.id}
                    className="p-2.5 bg-muted/20 border border-border rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Badge variant="outline" className="font-mono text-[10px] flex-shrink-0">
                        #{idx + 1}
                      </Badge>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {qItem.title || qItem.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayQueueItem(qItem.id)}
                        className="h-7 px-2 text-xs cursor-pointer"
                        title="Play Now"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveQueueItem(qItem.id)}
                        className="h-7 px-2 text-xs cursor-pointer"
                        title={t('watchParty.removeFromQueue')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
