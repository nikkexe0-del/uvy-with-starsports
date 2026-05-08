import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Copy, Search, Tv, Signal, Play, ExternalLink, RefreshCw, X, Globe } from 'lucide-react';
import { LivePlayer } from '../components/LivePlayer';
import { fetchAndParseSource, IPTV_SOURCES } from '../lib/iptv';

interface Channel {
  name: string;
  url: string;
  logo: string;
  group: string;
  keyId?: string;
  key?: string;
  cookie?: string;
  source?: string;
}

const SOURCES_CONFIG = [
  { id: 'jiotv', name: 'Jio TV', icon: <Tv size={14} /> },
  { id: 'india', name: 'India TV', icon: <Globe size={14} /> },
  { id: 'sports', name: 'Sports', icon: <Play size={14} /> },
  { id: 'news', name: 'News', icon: <Signal size={14} /> },
  { id: 'global', name: 'Global', icon: <Globe size={14} /> },
  { id: 'others', name: 'Others', icon: <Tv size={14} /> }
];

export default function LiveTV() {
  const [searchParams] = useSearchParams();
  const autoSelectName = searchParams.get('channel');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleGroupCount, setVisibleGroupCount] = useState(10);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
          setVisibleGroupCount(prev => prev + 5);
        }
      }, 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          Object.entries(IPTV_SOURCES)
            .filter(([key]) => !key.startsWith('grey'))
            .map(([key, url]) => fetchAndParseSource(url, key))
        );
        const flattened = results.flat();
        setChannels(flattened);

        if (autoSelectName) {
          const auto = flattened.find(c => c.name === autoSelectName);
          if (auto) setSelectedChannel(auto);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [autoSelectName]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    channels.forEach(c => cats.add(c.group || 'General'));
    return Array.from(cats).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let list = channels;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || c.group.toLowerCase().includes(s));
    }
    if (activeFilter !== 'all') {
      list = list.filter(c => c.group === activeFilter || c.source?.includes(activeFilter) || c.group.toLowerCase().includes(activeFilter));
    }
    return list;
  }, [search, channels, activeFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleGroupCount(10);
  }, [search, activeFilter]);

  const groupedChannels = useMemo(() => {
    const groups: Record<string, Channel[]> = {};
    filteredChannels.forEach(c => {
      const g = c.group || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    });
    return groups;
  }, [filteredChannels]);

  const visibleGroups = useMemo(() => {
    return Object.entries(groupedChannels).slice(0, visibleGroupCount);
  }, [groupedChannels, visibleGroupCount]);

  const getSourceDisplay = (source?: string) => {
    if (!source) return 'Unknown';
    if (source.includes('jiotv')) return 'JioTV';
    if (source.includes('india')) return 'India TV';
    if (source.includes('zilla')) return 'Zilla';
    if (source.includes('bd')) return 'BD TV';
    if (source.includes('clarity')) return 'Clarity';
    if (source.includes('global')) return 'Global';
    if (source.includes('amaze')) return 'Amaze';
    return source.split('_')[0].toUpperCase();
  };

  return (
    <div className="flex flex-col gap-8 w-full pt-28 px-4 md:px-12 pb-20 bg-black min-h-screen">
      
      {/* Player Section */}
      {selectedChannel && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500 mb-12">
          <div className="aspect-video bg-zinc-950 overflow-hidden relative rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group max-w-5xl mx-auto w-full">
            <LivePlayer
              url={selectedChannel.url}
              keyId={selectedChannel.keyId}
              key={selectedChannel.key}
              cookie={selectedChannel.cookie}
              onClose={() => setSelectedChannel(null)}
              title={selectedChannel.name}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-zinc-900/40 rounded-2xl border border-white/5 max-w-5xl mx-auto w-full backdrop-blur-xl">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-2 shrink-0 shadow-2xl">
                {selectedChannel.logo ? (
                  <img src={selectedChannel.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Tv className="w-6 h-6 text-zinc-700" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-white leading-none">{selectedChannel.name}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedChannel.group}</span>
                   <span className="w-1 h-1 rounded-full bg-zinc-800" />
                   <span className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded">Source: {getSourceDisplay(selectedChannel.source)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => { navigator.clipboard.writeText(selectedChannel.url); alert('Link Copied'); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-zinc-800/50 text-white hover:bg-zinc-700 transition-all text-[10px] font-black uppercase tracking-widest border border-white/5 shadow-2xl"
              >
                <Copy size={16} /> Copy
              </button>
              <button 
                onClick={() => window.open(selectedChannel.url, '_blank')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all text-[10px] font-black uppercase tracking-widest shadow-2xl"
              >
                 <ExternalLink size={16} /> New Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white leading-none">
              Live TV
            </h2>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[5px] mt-2 italic flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Unified Broadcast Core
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-4 focus-within:border-white/20 transition-all w-full md:w-[450px] shadow-3xl group">
            <Search size={22} className="text-zinc-600 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="TUNING FREQUENCY..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-zinc-800 focus:outline-none w-full font-black uppercase tracking-[2px]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="px-6 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-[2px] text-[10px] hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              Filter Category <Tv size={14} />
            </button>
            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-96 overflow-y-auto bg-zinc-950 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col p-2">
                <button
                  onClick={() => { setActiveFilter('all'); setShowCategoryMenu(false); }}
                  className={`px-4 py-2 text-left text-[10px] font-black uppercase tracking-[2px] transition-all rounded-lg ${activeFilter === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                >
                  All Categories
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveFilter(cat); setShowCategoryMenu(false); }}
                    className={`px-4 py-2 text-left text-[10px] font-black uppercase tracking-[2px] transition-all rounded-lg ${activeFilter === cat ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full max-w-full">
            {['all', 'sports', 'news', 'jio', 'movie', 'india', 'global'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-6 py-2 rounded-lg border text-[10px] font-black uppercase tracking-[2px] transition-all duration-300 ${
                  activeFilter === filter 
                    ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                    : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-white/20" />
          <div className="flex flex-col items-center gap-1">
             <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[8px] animate-pulse">Aggregating Streams</p>
             <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-[4px]">Source Link Decryption Active</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {visibleGroups.map(([group, groupChannels]) => (
            <div key={group} className="flex flex-col gap-8">
              <div className="flex items-center gap-6 px-2">
                 <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-white/40 shrink-0">
                    {group}
                 </h3>
                 <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                 <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">{groupChannels.length} Channels</span>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6">
                {groupChannels.slice(0, 50).map((channel, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedChannel(channel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`group relative flex flex-col gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer border w-[45%] sm:w-[30%] lg:w-[15%] ${
                      selectedChannel?.url === channel.url 
                        ? 'bg-zinc-800 text-white border-white/30 scale-105 z-10' 
                        : 'bg-zinc-950 border-transparent hover:bg-zinc-900 hover:border-white/10'
                    }`}
                  >
                    <div className={`aspect-video rounded-md shrink-0 border flex items-center justify-center overflow-hidden transition-all duration-500 relative z-10 ${
                        selectedChannel?.url === channel.url ? 'bg-black border-black/5' : 'bg-black/50 border-transparent group-hover:border-white/10'
                    }`}>
                      {channel.logo ? (
                        <img src={channel.logo} alt="" className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" loading="lazy" />
                      ) : (
                        <Tv className={`w-8 h-8 transition-colors ${selectedChannel?.url === channel.url ? 'text-white/20' : 'text-zinc-700'}`} />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="text-white fill-white scale-75 group-hover:scale-100 transition-transform" size={24} />
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col px-1">
                      <p className={`text-xs font-bold truncate ${selectedChannel?.url === channel.url ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                        {channel.name}
                      </p>
                      <div className="flex items-center justify-between opacity-60 mt-1">
                         <span className="text-[9px] font-bold uppercase tracking-widest truncate">{getSourceDisplay(channel.source)}</span>
                         {selectedChannel?.url === channel.url && <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                ))}
                {groupChannels.length > 50 && (
                  <div className="flex items-center justify-center p-4 w-full text-zinc-500 text-xs font-bold">
                    + {groupChannels.length - 50} more channels in this category. Use search to find them.
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredChannels.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center gap-8 text-center">
              <Signal size={64} className="text-zinc-900 animate-bounce" />
              <div className="flex flex-col gap-2">
                 <p className="text-zinc-400 font-black uppercase tracking-[15px] leading-none">Frequency Drift</p>
                 <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[4px]">No broadcasts detected at this range</p>
              </div>
              <button 
                onClick={() => { setSearch(''); setActiveFilter('all'); }} 
                className="text-[10px] text-white font-black uppercase tracking-[4px] px-8 py-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                Reset Frequency
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
