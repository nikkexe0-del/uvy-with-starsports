import React, { useState, useEffect } from 'react';
import { Loader2, Play, Info, X, Search } from 'lucide-react';
import { LivePlayer } from '../components/LivePlayer';

interface Video {
  title: string;
  upload_time?: string;
  duration?: string;
  page_url?: string;
  thumbnail: string;
  stream_type?: string;
  stream_url: string;
  keyId?: string;
  key?: string;
  cookie?: string;
}

const SOURCES = [
  { name: 'Grey Library', url: 'https://raw.githubusercontent.com/sportlive18/above18/main/alt-m3u8.json' },
  { name: 'Above 18+', url: 'https://raw.githubusercontent.com/sportlive18/above18/main/m3u8.json' },
  { name: 'Ullu Special', url: 'https://raw.githubusercontent.com/sportlive18/above18/main/ullu-m3u8.json' }
];

export default function GreyTV() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const results = await Promise.all(
        SOURCES.map(source => 
          fetch(source.url)
            .then(res => res.json())
            .then(data => {
              const list = Array.isArray(data) ? data : (data.videos || data.channels || data.data || data.list || data.streams || data.items || []);
              return list.map((v: any) => ({
                ...v,
                title: v.title || v.name || v.label || v.channelName || 'Unknown',
                thumbnail: v.thumbnail || v.logo || v.image || v.poster || '',
                stream_url: v.stream_url || v.url || v.link || v.streamLink || ''
              }));
            })
            .catch(() => [])
        )
      );
      const allVideos = results.flat();
      setVideos(allVideos);
      setFilteredVideos(allVideos);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(v => 
      v.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [search, videos]);

  if (loading) {
    return (
       <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-netflix-red" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black min-h-screen text-white font-sans overflow-x-hidden pt-24 pb-20">
      
      {/* Player Section */}
      {playingVideo && (
        <div className="px-4 md:px-12 mb-12 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="aspect-video bg-zinc-950 overflow-hidden relative rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group max-w-5xl mx-auto w-full">
            <LivePlayer
              url={playingVideo.stream_url}
              keyId={playingVideo.keyId}
              key={playingVideo.key}
              cookie={playingVideo.cookie}
              onClose={() => setPlayingVideo(null)}
              title={playingVideo.title}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-zinc-900/40 rounded-2xl border border-white/5 max-w-5xl mx-auto w-full backdrop-blur-xl">
             <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-2 shrink-0 shadow-2xl">
                   <img src={playingVideo.thumbnail} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                   <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-white leading-none">{playingVideo.title}</h3>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Library Sync • {playingVideo.duration || 'Feature'}</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Grid Header */}
      <div className="px-4 md:px-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
            Grey TV
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[4px] mt-2">The Underground Library • {videos.length} Titles</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/60 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-white/30 transition-all w-full md:w-96 shadow-2xl">
          <Search size={20} className="text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search library..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm text-white placeholder-zinc-700 focus:outline-none w-full font-bold uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="px-4 md:px-12 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredVideos.map((video, idx) => (
          <div 
            key={idx}
            className="group relative flex flex-col gap-3 animate-in fade-in duration-500"
            onClick={() => setPlayingVideo(video)}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/5 bg-zinc-900">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play className="fill-white text-white ml-1" size={24} />
                 </div>
              </div>

              <div className="absolute bottom-3 right-3">
                 {video.duration && <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest">{video.duration}</span>}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-black text-sm uppercase tracking-tighter italic text-zinc-300 group-hover:text-white transition-colors line-clamp-1">{video.title}</h3>
              <div className="flex items-center gap-2">
                 <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest">{Math.min(99, Math.floor(75 + Math.random() * 20))}% Match</span>
                 <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{video.upload_time}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredVideos.length === 0 && (
           <div className="col-span-full py-40 text-center flex flex-col items-center gap-6">
              <Search size={64} className="text-zinc-800 animate-pulse" />
              <p className="text-zinc-700 font-black uppercase tracking-[8px] text-xl">Index Empty</p>
              <button onClick={() => setSearch('')} className="text-xs text-netflix-red hover:underline tracking-widest font-bold">RESET SEARCH</button>
           </div>
        )}
      </div>
    </div>
  );
}
