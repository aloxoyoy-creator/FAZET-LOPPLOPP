import React from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  SkipForward, 
  SkipBack, 
  Layers, 
  Tv, 
  Disc3,
  Repeat,
  Radio,
  ListMusic
} from 'lucide-react';
import { useYoutubePlayer } from '../../context/YoutubePlayerContext';

export default function FloatingYoutubePlayer() {
  const {
    activeVideo,
    autoPlaylist,
    isFloating,
    isMinimized,
    autoPlayEnabled,
    setFloating,
    setMinimized,
    setAutoPlayEnabled,
    playNext,
    playPrev,
    closePlayer,
  } = useYoutubePlayer();

  if (!activeVideo || !isFloating) {
    return null;
  }

  const nextTrack = autoPlaylist.length > 0 ? autoPlaylist[0] : null;

  // Minimized Bar Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[90] flex items-center gap-3 p-2.5 px-4 rounded-full bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/60 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="relative">
          <Disc3 size={24} className="text-red-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="max-w-[140px] sm:max-w-[220px] truncate">
          <p className="text-xs font-bold truncate leading-tight">{activeVideo.title}</p>
          <p className="text-[10px] text-indigo-400 truncate">
            {nextTrack ? `Berikutnya: ${nextTrack.title}` : activeVideo.channelTitle}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={playPrev}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Lagu Sebelumnya"
          >
            <SkipBack size={15} />
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!nextTrack}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Lanjut ke Lagu Sejenis Berikutnya"
          >
            <SkipForward size={15} />
          </button>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors ml-1"
            title="Perbesar Layar Mengambang"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            onClick={closePlayer}
            className="p-1 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Tutup"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Expanded Floating PiP Window Mode
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[90] w-[320px] sm:w-[380px] rounded-3xl bg-slate-950/95 text-white backdrop-blur-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 animate-in zoom-in-95">
      {/* Header Floating Window */}
      <div className="flex items-center justify-between p-3 px-4 bg-slate-900/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-red-600 text-white shrink-0">
            <Radio size={13} className="animate-pulse" />
          </span>
          <span className="text-xs font-bold truncate text-slate-200">
            Auto-Playlist Radio Lagu
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
              autoPlayEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
            title="Auto-Playlist Otomatis Lanjut saat lagu habis"
          >
            <Repeat size={10} className={autoPlayEnabled ? 'animate-pulse' : ''} />
            <span>Auto</span>
          </button>

          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Ciutkan ke Bar Mini"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            onClick={() => setFloating(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Kembalikan ke Halaman"
          >
            <Layers size={14} />
          </button>

          <button
            type="button"
            onClick={closePlayer}
            className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Tutup Player"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Video Iframe Container */}
      <div className="relative aspect-video bg-black w-full overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&enablejsapi=1`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Control Footer */}
      <div className="p-3 px-4 bg-slate-900/90 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate leading-tight">
              {activeVideo.title}
            </h4>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {activeVideo.channelTitle}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={playPrev}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Putar Sebelumnya"
            >
              <SkipBack size={14} />
            </button>
            <button
              type="button"
              onClick={playNext}
              disabled={!nextTrack}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              title="Putar Lagu Sejenis Selanjutnya"
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* Info Lagu Terkait Berikutnya */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 truncate max-w-[230px]">
            <ListMusic size={12} className="text-indigo-400 shrink-0" />
            <span className="truncate">
              {nextTrack ? `Berikutnya: ${nextTrack.title}` : 'Memuat rekomendasi...'}
            </span>
          </div>
          <span className="text-emerald-400 font-semibold shrink-0 ml-1">
            {autoPlayEnabled ? 'Auto ON' : 'Manual'}
          </span>
        </div>
      </div>
    </div>
  );
}
