import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Search, 
  Play, 
  Loader2, 
  Tv, 
  Layers, 
  Repeat, 
  SkipForward, 
  SkipBack, 
  Sparkles, 
  Check, 
  Volume2 
} from 'lucide-react';
import { useYoutubePlayer, GENRE_PLAYLISTS, type VideoItem } from '../../context/YoutubePlayerContext';

const API_KEYS = [
  'AIzaSyDW4y5U6aCkLcLxGAKU7bGqaWH8Ppe8ng4',
  'AIzaSyC6-O6GoBgsvfGoRb9bsGNSVTeplQfnwEM'
];

export default function YoutubeWidget() {
  const {
    activeVideo,
    playlist,
    currentIndex,
    currentGenre,
    isFloating,
    autoPlayNextGenre,
    playVideo,
    playNext,
    playPrev,
    selectGenre,
    setFloating,
    setAutoPlayNextGenre,
  } = useYoutubePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'genre' | 'search'>('genre');

  const fetchCustomVideos = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setMode('search');
    try {
      let res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=video&key=${API_KEYS[0]}`);
      if (!res.ok) {
        res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=video&key=${API_KEYS[1]}`);
      }
      const data = await res.json();
      if (data.items) {
        const mapped: VideoItem[] = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle
        }));
        setSearchResults(mapped);
      }
    } catch (err) {
      console.error('Error fetching YouTube:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchCustomVideos(searchQuery);
  };

  // Determine current active genre option
  const activeGenreOption = GENRE_PLAYLISTS.find(g => g.id === currentGenre) || GENRE_PLAYLISTS[0];
  const displayedVideos = mode === 'search' ? searchResults : activeGenreOption.videos;

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-red-500/10 p-2 rounded-2xl text-red-600 dark:text-red-400">
                <Youtube size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">YouTube Study & Fokus</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                Layar Mengambang • Auto-Lanjut
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Temani belajarmu dengan video lo-fi, murottal, piano, atau cari playlist favorit
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari video YouTube..." 
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>
            <button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-2xl transition-colors shadow-xs"
              title="Cari"
            >
              <Search size={15} />
            </button>
          </form>
        </div>

        {/* Genre Selector Pills */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" /> Pilih Genre Musik / Audio
            </span>
            <button
              type="button"
              onClick={() => setAutoPlayNextGenre(!autoPlayNextGenre)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                autoPlayNextGenre
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
              title="Otomatis memutar video selanjutnya dalam genre saat video habis"
            >
              <Repeat size={12} className={autoPlayNextGenre ? 'animate-pulse' : ''} />
              <span>Auto-Lanjut: {autoPlayNextGenre ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GENRE_PLAYLISTS.map((g) => {
              const isSelected = mode === 'genre' && currentGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setMode('genre');
                    selectGenre(g.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-sm scale-102'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-500/40 hover:bg-red-500/5'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Active Video Player (jika tidak sedang mengambang) */}
        {activeVideo && !isFloating && (
          <div className="relative z-10 w-full rounded-3xl overflow-hidden bg-black mb-6 shadow-xl border border-slate-800">
            <div className="relative aspect-video">
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&enablejsapi=1`} 
                title={activeVideo.title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>

            {/* Bar Kontrol Bawah Video */}
            <div className="p-4 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  Sedang Diputar • {activeGenreOption.label}
                </span>
                <h3 className="text-sm font-bold text-white truncate leading-tight mt-0.5">
                  {activeVideo.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={playPrev}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="Video Sebelumnya"
                >
                  <SkipBack size={16} />
                </button>
                <button 
                  type="button"
                  onClick={playNext}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="Video Selanjutnya (Auto Lanjut)"
                >
                  <SkipForward size={16} />
                </button>

                {/* Tombol Layar Mengambang (Picture in Picture) */}
                <button 
                  type="button"
                  onClick={() => setFloating(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  title="Ubah ke Layar Mengambang agar bisa scroll & buka halaman lain sambil nonton"
                >
                  <Tv size={14} />
                  <span>Layar Mengambang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid Cards */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {mode === 'search' ? `Hasil Pencarian: "${searchQuery}"` : `Daftar Trek: ${activeGenreOption.label}`}
            </span>
            <span className="text-[11px] text-slate-500">
              {displayedVideos.length} Video Siap Putar
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="font-semibold text-xs">Mencari video di YouTube...</span>
            </div>
          ) : displayedVideos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {displayedVideos.map((v, idx) => {
                const isCurrent = activeVideo?.id === v.id;
                return (
                  <div 
                    key={v.id} 
                    className="group cursor-pointer flex flex-col gap-2"
                    onClick={() => playVideo(v, displayedVideos, currentGenre)}
                  >
                    <div className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border transition-all duration-300 ${
                      isCurrent 
                        ? 'border-red-500 ring-2 ring-red-500/30 shadow-md' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-red-400'
                    }`}>
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-red-600 text-white rounded-full p-2.5 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                          <Play size={16} className="ml-0.5 fill-current" />
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Memutar
                        </div>
                      )}
                    </div>
                    <div className="px-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors" dangerouslySetInnerHTML={{ __html: v.title }}></h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{v.channelTitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Youtube size={32} className="text-slate-300 dark:text-slate-600 mb-1" />
              <span className="font-semibold text-xs">Tidak ada video yang ditemukan.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
