import React, { useState } from 'react';
import {
  Search,
  Play,
  Loader2,
  Tv,
  Radio,
  Repeat,
  SkipForward,
  SkipBack,
  Sparkles,
  ListMusic,
  Music2,
} from 'lucide-react';
import {
  useYoutubePlayer,
  STARTER_CATEGORIES,
} from '../../context/YoutubePlayerContext';

export default function YoutubeWidget() {
  const {
    activeVideo,
    autoPlaylist,
    isFloating,
    autoPlayEnabled,
    isLoadingAutoPlaylist,
    playVideo,
    playNext,
    playPrev,
    playFromAutoPlaylist,
    playFromUrlOrSearch,
    setFloating,
    setAutoPlayEnabled,
    requestExternalPiP,
  } = useYoutubePlayer();

  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('pop_indo');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleSearchOrUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const success = await playFromUrlOrSearch(inputQuery);
      if (success) {
        setInputQuery('');
        setFeedbackMsg('Trek diputar. Auto-Playlist menyiapkan lagu seirama berikutnya.');
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setFeedbackMsg('Video tidak ditemukan. Masukkan judul lagu atau tautan YouTube yang valid.');
        setTimeout(() => setFeedbackMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Terjadi kendala saat memuat trek audio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryObj = STARTER_CATEGORIES.find((c) => c.id === activeCategory) || STARTER_CATEGORIES[0];

  return (
    <div className="w-full">
      <div className="bg-[var(--tf-bg-surface)] rounded-[var(--tf-radius-card)] p-5 sm:p-7 border border-[var(--tf-border)] shadow-[var(--tf-shadow-raised)]">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-[var(--tf-border)]">
          <div>
            <div className="studio-eyebrow mb-1">
              <Music2 size={12} />
              <span>Audio Lounge &amp; Auto-Playlist</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-[var(--tf-text-primary)]">
                Studio Musik &amp; Fokus
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border border-[var(--tf-accent)]/20">
                <Radio size={11} />
                Radio Adaptif
              </span>
            </div>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Putar lagu pilihanmu; sistem otomatis merangkai antrean lagu yang seirama di latar belakang.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                autoPlayEnabled
                  ? 'bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] border-[var(--tf-accent)]/30'
                  : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-muted)] border-[var(--tf-border)]'
              }`}
            >
              <Repeat size={13} />
              <span>Auto-Playlist: {autoPlayEnabled ? 'Aktif' : 'Nonaktif'}</span>
            </button>
          </div>
        </div>

        {/* Search / URL Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearchOrUrl} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tf-text-muted)]" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Cari judul lagu, artis, atau tempel tautan YouTube..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] rounded-xl focus:outline-none focus:border-[var(--tf-accent)] focus:bg-[var(--tf-bg-surface)] text-[var(--tf-text-primary)] placeholder:text-[var(--tf-text-muted)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !inputQuery.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--tf-primary)] hover:bg-[var(--tf-primary-hover)] disabled:opacity-50 text-[var(--tf-bg-surface)] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Play size={14} className="fill-current" />}
              <span>Putar Trek</span>
            </button>
          </form>

          {feedbackMsg && (
            <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-[var(--tf-bg-subtle)] border border-[var(--tf-border)] text-xs text-[var(--tf-text-secondary)] flex items-center gap-2">
              <Sparkles size={13} className="text-[var(--tf-accent)]" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Active Player */}
        {activeVideo && !isFloating && (
          <div className="w-full rounded-2xl overflow-hidden bg-black mb-6 border border-[var(--tf-border)]">
            <div className="relative aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&enablejsapi=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-[var(--tf-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--tf-border)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--tf-accent-soft)] text-[var(--tf-accent)] text-[10px] font-semibold uppercase tracking-wider">
                    Sedang Diputar
                  </span>
                  <span className="text-xs text-[var(--tf-text-muted)] truncate">
                    {activeVideo.channelTitle}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--tf-text-primary)] truncate mt-1">
                  {activeVideo.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={playPrev}
                  className="p-2 rounded-xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/40 text-[var(--tf-text-primary)] transition-colors cursor-pointer"
                  title="Trek Sebelumnya"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  type="button"
                  onClick={playNext}
                  disabled={autoPlaylist.length === 0}
                  className="p-2 rounded-xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/40 disabled:opacity-40 text-[var(--tf-text-primary)] transition-colors cursor-pointer"
                  title="Trek Berikutnya"
                >
                  <SkipForward size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFloating(true);
                    void requestExternalPiP();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] text-xs font-medium transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <Tv size={14} />
                  <span>Layar Mengambang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Playlist Queue */}
        {activeVideo && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--tf-bg-subtle)]/60 border border-[var(--tf-border)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <ListMusic size={15} className="text-[var(--tf-accent)]" />
                <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tf-text-primary)]">
                  Antrean Auto-Playlist ({autoPlaylist.length})
                </h4>
              </div>

              {isLoadingAutoPlaylist && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--tf-text-muted)]">
                  <Loader2 size={13} className="animate-spin text-[var(--tf-accent)]" />
                  <span>Menyusun antrean...</span>
                </div>
              )}
            </div>

            {autoPlaylist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {autoPlaylist.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playFromAutoPlaylist(idx)}
                    className="group cursor-pointer flex items-center gap-3 p-2 rounded-xl bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] hover:border-[var(--tf-accent)]/50 transition-all"
                  >
                    <div className="relative w-14 h-9 rounded-lg overflow-hidden shrink-0 bg-[var(--tf-bg-subtle)]">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[var(--tf-text-primary)] truncate group-hover:text-[var(--tf-accent)] transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-[var(--tf-text-muted)] truncate">
                        {track.channelTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[var(--tf-text-muted)]">
                {isLoadingAutoPlaylist ? 'Menyiapkan daftar putar...' : 'Belum ada antrean trek serupa.'}
              </div>
            )}
          </div>
        )}

        {/* Curated Starter Categories */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tf-text-muted)]">
              Kurasi Musik &amp; Suasana
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {STARTER_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--tf-primary)] text-[var(--tf-bg-surface)] border-[var(--tf-primary)]'
                      : 'bg-[var(--tf-bg-subtle)] text-[var(--tf-text-secondary)] border-[var(--tf-border)] hover:border-[var(--tf-accent)]/40 hover:text-[var(--tf-text-primary)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentCategoryObj.tracks.map((track) => {
              const isCurrent = activeVideo?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playVideo(track)}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div
                    className={`relative aspect-video rounded-xl overflow-hidden bg-[var(--tf-bg-subtle)] border transition-all ${
                      isCurrent
                        ? 'border-[var(--tf-accent)] ring-2 ring-[var(--tf-accent)]/25'
                        : 'border-[var(--tf-border)] group-hover:border-[var(--tf-accent)]/50'
                    }`}
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="h-9 w-9 rounded-full bg-black/65 text-white backdrop-blur-xs grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-medium uppercase tracking-wider backdrop-blur-xs">
                        Diputar
                      </div>
                    )}
                  </div>
                  <div className="px-0.5">
                    <h4 className="text-xs font-medium text-[var(--tf-text-primary)] line-clamp-1 group-hover:text-[var(--tf-accent)] transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-[var(--tf-text-muted)] mt-0.5 line-clamp-1">
                      {track.channelTitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
