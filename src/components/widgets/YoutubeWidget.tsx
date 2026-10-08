import React, { useState, useEffect } from 'react';
import { Youtube, Search, Play, Loader2 } from 'lucide-react';

const API_KEYS = [
  'AIzaSyDW4y5U6aCkLcLxGAKU7bGqaWH8Ppe8ng4',
  'AIzaSyC6-O6GoBgsvfGoRb9bsGNSVTeplQfnwEM'
];

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

export default function YoutubeWidget() {
  const [query, setQuery] = useState('lofi hip hop study');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const fetchVideos = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Coba pakai API key pertama, kalau gagal coba yang kedua
      let res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(searchQuery)}&type=video&key=${API_KEYS[0]}`);
      
      if (!res.ok) {
        res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(searchQuery)}&type=video&key=${API_KEYS[1]}`);
      }

      const data = await res.json();
      if (data.items) {
        setVideos(data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle
        })));
      }
    } catch (err) {
      console.error('Error fetching YouTube:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(query);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchVideos(query);
      setActiveVideoId(null);
    }
  };

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-400/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl text-red-600 dark:text-red-400">
                <Youtube size={18} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">YouTube Study</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Temani belajarmu dengan video favorit</p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari video..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>

        {activeVideoId ? (
          <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-black aspect-video mb-6 shadow-md border border-slate-200 dark:border-slate-800">
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
            <button 
              onClick={() => setActiveVideoId(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-colors"
            >
              Tutup Video
            </button>
          </div>
        ) : null}

        <div className="relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
              <span className="font-semibold text-sm">Mencari video...</span>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {videos.map(v => (
                <div 
                  key={v.id} 
                  className="group cursor-pointer flex flex-col gap-2"
                  onClick={() => setActiveVideoId(v.id)}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-red-600 text-white rounded-full p-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                        <Play size={16} className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight" dangerouslySetInnerHTML={{ __html: v.title }}></h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{v.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Youtube size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
              <span className="font-semibold text-sm">Tidak ada video yang ditemukan.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
