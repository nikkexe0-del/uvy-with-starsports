import React, { useState, useEffect } from 'react';
import { Loader2, Play, Info, X, Search, Trophy } from 'lucide-react';

interface IPLMatch {
  channelNumber: number;
  channelName: string;
  subText: string;
  channelUrl: string;
  thumbnail: string;
}

export default function IPLHighlights() {
  const [matches, setMatches] = useState<IPLMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<IPLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState<IPLMatch | null>(null);
  const [playingMatch, setPlayingMatch] = useState<IPLMatch | null>(null);
  const [search, setSearch] = useState('');

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://raw.githubusercontent.com/jitupatel2506/ipl_data_api/main/ipl_2025.json');
      if (!response.ok) throw new Error('Failed to fetch IPL data');
      const data = await response.json();
      setMatches(data);
      setFilteredMatches(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    const filtered = matches.filter(m => 
      m.channelName.toLowerCase().includes(search.toLowerCase()) ||
      m.subText.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMatches(filtered);
  }, [search, matches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="relative">
            <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-netflix-red" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Highlights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 px-4 text-center">
        <Trophy size={48} className="mb-4 opacity-20" />
        <p className="font-bold text-xl mb-2">Innings Break: {error}</p>
        <p className="text-sm text-zinc-500 mb-6">The feed might be temporarily down. Check your connection or try again.</p>
        <button onClick={() => window.location.reload()} className="bg-netflix-red px-8 py-3 rounded text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform">Retry Connection</button>
      </div>
    );
  }

  const heroMatch = matches.length > 0 ? matches[0] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-sans pb-20 pt-28">
      {/* Player Overlay - Only show when playing */}
      {playingMatch && (
        <div className="fixed inset-0 z-[200] bg-black animate-in fade-in duration-300">
          <button 
            onClick={() => setPlayingMatch(null)}
            className="absolute top-6 left-6 z-[210] w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-white/20 text-white transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>
          
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; background: #000; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                    video { width: 100%; height: 100%; outline: none; background: #000; }
                    #msg { position: absolute; color: white; font-family: sans-serif; font-size: 14px; text-align: center; width: 100%; top: 50%; transform: translateY(-50%); display: none; padding: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;}
                    .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #E50914; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; position: absolute; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  </style>
                </head>
                <body>
                  <div id="loader" class="loader"></div>
                  <video id="video" controls playsinline autoplay src="${playingMatch.channelUrl}"></video>
                  <script>
                    const video = document.getElementById('video');
                    const loader = document.getElementById('loader');
                    video.addEventListener('canplay', () => { loader.style.display = 'none'; });
                    video.addEventListener('playing', () => { loader.style.display = 'none'; });
                    video.addEventListener('waiting', () => { loader.style.display = 'block'; });
                  </script>
                </body>
              </html>
            `}
            className="w-full h-full border-none"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            key={playingMatch.channelUrl}
          />
        </div>
      )}

      {/* Grid Header */}
      <div className="px-4 md:px-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
            IPL Highlights
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[4px] mt-2">Relive The Action • {matches.length} Matches Indexed</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/60 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-white/30 transition-all w-full md:w-96 shadow-2xl">
          <Search size={20} className="text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search match..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm text-white placeholder-zinc-700 focus:outline-none w-full font-bold uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {filteredMatches.map((match, idx) => (
          <div 
            key={idx}
            className="group relative flex flex-col bg-zinc-900/20 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            onClick={() => setPlayingMatch(match)}
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={match.thumbnail} 
                alt={match.channelName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 scale-50 group-hover:scale-100 transition-transform duration-500">
                      <Play className="fill-white text-white ml-1" />
                  </div>
              </div>
            </div>
            
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-black tracking-widest text-netflix-red uppercase">Highlights</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-black px-2 py-0.5 rounded-md border border-white/5">{match.subText}</span>
              </div>
              <h3 className="font-black text-lg md:text-xl uppercase tracking-tighter text-white leading-tight line-clamp-2 italic group-hover:text-netflix-red transition-colors">
                  {match.channelName.replace(' Highlights', '')}
              </h3>
            </div>
          </div>
        ))}

        {filteredMatches.length === 0 && (
           <div className="col-span-full py-40 text-center flex flex-col items-center gap-6">
              <Trophy size={64} className="text-zinc-800 animate-pulse" />
              <p className="text-zinc-700 font-black uppercase tracking-[8px] text-xl">Match Not Found</p>
              <button onClick={() => setSearch('')} className="text-xs text-netflix-red hover:underline tracking-widest font-bold">RESET STADIUM</button>
           </div>
        )}
      </div>
    </div>
  );
}
