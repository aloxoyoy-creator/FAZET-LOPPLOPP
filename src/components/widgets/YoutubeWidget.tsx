import React, { useState } from 'react';
import { 
  Youtube, 
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
  Link2,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { 
  useYoutubePlayer, 
  STARTER_CATEGORIES, 
  type VideoItem 
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
        setFeedbackMsg('Lagu diputar! Auto-Playlist sedang menyiapkan lagu-lagu sejenis berikutnya.');
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setFeedbackMsg('Video tidak ditemukan. Coba masukkan judul lagu atau link YouTube yang valid.');
        setTimeout(() => setFeedbackMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Terjadi kesalahan saat memuat lagu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryObj = STARTER_CATEGORIES.find(c => c.id === activeCategory) || STARTER_CATEGORIES[0];

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="bg-red-500/10 p-2 rounded-2xl text-red-600 dark:text-red-400">
                <Youtube size={22} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                YouTube Audio & Auto-Playlist
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Radio size={11} className="animate-pulse" />
                Radio Sesuai Lagu
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Putar lagu apa saja — sistem otomatis menemukan dan memutar lagu-lagu seirama berikutnya!
            </p>
          </div>

          {/* Toggle Auto Playlist */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                autoPlayEnabled
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent'
              }`}
              title="Otomatis melanjutkan ke lagu-lagu sejenis berikutnya saat lagu ini selesai"
            >
              <Repeat size={13} className={autoPlayEnabled ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
              <span>Auto-Playlist: {autoPlayEnabled ? 'AKTIF' : 'NONAKTIF'}</span>
            </button>
          </div>
        </div>

        {/* Universal Input Bar: Search or Paste URL */}
        <div className="relative z-10 mb-6">
          <form onSubmit={handleSearchOrUrl} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Cari lagu (misal: 'Tulus Monokrom') atau tempel tautan YouTube..." 
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/40 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !inputQuery.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-colors shadow-xs shrink-0"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={15} className="fill-current" />
              )}
              <span>Putar & Auto-Playlist</span>
            </button>
          </form>

          {feedbackMsg && (
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles size={13} />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Inline Active Player (jika tidak dalam mode floating) */}
        {activeVideo && !isFloating && (
          <div className="relative z-10 w-full rounded-3xl overflow-hidden bg-black mb-6 shadow-2xl border border-slate-800">
            <div className="relative aspect-video">
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&enablejsapi=1`} 
                title={activeVideo.title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>

            {/* Video Controls & Status Bar */}
            <div className="p-4 sm:p-5 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                    Sedang Diputar
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold truncate">
                    {activeVideo.channelTitle}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate leading-tight mt-1">
                  {activeVideo.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={playPrev}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack size={16} />
                </button>
                <button 
                  type="button"
                  onClick={playNext}
                  disabled={autoPlaylist.length === 0}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
                  title="Lanjut ke Lagu Terkait Berikutnya"
                >
                  <SkipForward size={16} />
                </button>

                {/* Tombol Layar Mengambang */}
                <button 
                  type="button"
                  onClick={() => setFloating(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
                  title="Buka Layar Mengambang (Picture in Picture) agar bisa membuka menu tugas atau jadwal sambil mendengarkan"
                >
                  <Tv size={15} />
                  <span>Layar Mengambang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Playlist Section (Menampilkan antrean lagu yang seirama dengan lagu yang sedang aktif) */}
        {activeVideo && (
          <div className="relative z-10 mb-8 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ListMusic size={17} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Auto-Playlist Lagu Ini
                    <span className="text-[10px] font-normal text-slate-400">({autoPlaylist.length} trek sejenis berikutnya)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Otomatis berlanjut ke trek-trek di bawah ini saat lagu selesai diputar
                  </p>
                </div>
              </div>

              {isLoadingAutoPlaylist && (
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-500 font-semibold animate-pulse">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Mencari lagu sejenis...</span>
                </div>
              )}
            </div>

            {autoPlaylist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {autoPlaylist.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playFromAutoPlaylist(idx)}
                    className="group cursor-pointer flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 shadow-2xs hover:shadow-sm"
                  >
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                        <Play size={12} className="text-white opacity-0 group-hover:opacity-100 fill-current transition-opacity" />
                      </div>
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-white/90 drop-shadow">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {track.channelTitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors shrink-0"
                      title="Putar Lagu Ini Sekarang"
                    >
                      <Play size={13} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                {isLoadingAutoPlaylist ? 'Menyiapkan playlist yang cocok...' : 'Belum ada antrean lagu sejenis. Coba cari lagu lain!'}
              </div>
            )}
          </div>
        )}

        {/* Starter Picks / Inspirasi Lagu Pembuka */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Inspirasi Lagu Pembuka
            </span>
            <span className="text-[11px] text-slate-400">
              Klik untuk memutar & auto-playlist sejenis langsung aktif
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {STARTER_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Track Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {currentCategoryObj.tracks.map((track) => {
              const isCurrent = activeVideo?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playVideo(track)}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border transition-all duration-300 ${
                    isCurrent 
                      ? 'border-red-500 ring-2 ring-red-500/30 shadow-md' 
                      : 'border-slate-200 dark:border-slate-700/80 hover:border-red-400'
                  }`}>
                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-red-600 text-white rounded-full p-2.5 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                        <Play size={15} className="ml-0.5 fill-current" />
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                        Sedang Diputar
                      </div>
                    )}
                  </div>
                  <div className="px-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
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
