import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchContent, TMDBItem } from '../lib/tmdb';
import { searchAllIPTVChannels, Channel } from '../lib/iptv';
import { MediaCard } from '../components/MediaCard';
import { Loader2, Tv, Play, Search as SearchIcon, X } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState<TMDBItem[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movies' | 'shows' | 'tv'>('all');

  // Sync local query with URL param on mount or back/forward
  useEffect(() => {
    if (query !== localQuery) {
      setLocalQuery(query);
    }
  }, [query]);

  // Debounced Auto-Search
  useEffect(() => {
    if (localQuery.length < 3) {
      if (localQuery === '') {
        setResults([]);
        setChannels([]);
        setSearchParams({});
      }
      return;
    }

    const timer = setTimeout(() => {
      setSearchParams({ q: localQuery });
      
      setLoading(true);
      Promise.all([
        searchContent(localQuery),
        searchAllIPTVChannels(localQuery)
      ])
        .then(([tmdbResults, iptvResults]) => {
          setResults(tmdbResults);
          setChannels(iptvResults);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery });
    }
  };

  const handleChannelClick = (channel: Channel) => {
    navigate(`/live-tv?channel=${encodeURIComponent(channel.name)}`);
  };

  return (
    <div className="w-full pt-24 md:pt-28 px-4 md:px-12 flex flex-col gap-10 min-h-screen">
      {/* Prominent Search Bar */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSearchSubmit} className="relative group w-full max-w-4xl">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Search for movies, TV shows, or channels..." 
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-xl font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-netflix-red focus:ring-4 focus:ring-netflix-red/10 transition-all uppercase tracking-tight"
          />
          {localQuery && (
            <button 
              type="button" 
              onClick={() => { setLocalQuery(''); setResults([]); setChannels([]); setSearchParams({}); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </form>

        {query && (
           <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-zinc-400">
                Showing results for: <span className="text-white">"{query}"</span>
              </h1>
              <div className="h-0.5 w-24 bg-netflix-red" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'movies', label: 'Movies' },
                { id: 'shows', label: 'TV Shows' },
                { id: 'tv', label: 'Channels' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${
                    filter === tab.id 
                      ? 'bg-netflix-red text-white border-netflix-red shadow-[0_0_20px_rgba(229,9,20,0.4)]' 
                      : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-40">
          <Loader2 className="w-12 h-12 animate-spin text-netflix-red" />
        </div>
      ) : (results.length > 0 || channels.length > 0) ? (
        <div className="flex flex-col gap-16 pb-20">
          {(filter === 'all' || filter === 'tv') && channels.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                <Tv className="text-netflix-red" size={24} /> TV Channels
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {channels.slice(0, 20).map((channel, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleChannelClick(channel)}
                    className="group bg-zinc-900/40 border border-white/5 rounded-xl p-3 hover:bg-zinc-800 transition-all cursor-pointer flex flex-col gap-2"
                  >
                    <div className="aspect-square bg-black rounded-lg flex items-center justify-center p-3 relative overflow-hidden">
                       {channel.logo ? (
                         <img src={channel.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                       ) : (
                         <Tv className="text-zinc-800 w-8 h-8" />
                       )}
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Play size={20} className="text-white fill-white" />
                       </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] md:text-xs font-bold text-zinc-300 truncate uppercase">{channel.name}</p>
                      <p className="text-[8px] text-zinc-600 truncate uppercase tracking-tighter">{channel.group}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(filter === 'all' || filter === 'movies' || filter === 'shows') && results.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-white">
                {filter === 'movies' ? 'Movies' : filter === 'shows' ? 'TV Shows' : 'Movies & Shows'}
              </h2>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-12">
                {results
                  .filter(item => {
                    if (filter === 'movies') return item.media_type === 'movie';
                    if (filter === 'shows') return item.media_type === 'tv';
                    return true;
                  })
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : query ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40 text-zinc-500 gap-4">
          <p className="text-lg font-medium">Your search for "{query}" did not have any matches.</p>
          <ul className="text-sm list-disc list-inside flex flex-col gap-2">
            <li>Try different keywords</li>
            <li>Looking for a movie or TV show?</li>
            <li>Try using a movie or TV show title</li>
          </ul>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-40 text-zinc-800">
           <SearchIcon size={80} className="opacity-10 mb-6" />
           <p className="text-xl font-black uppercase tracking-[10px] opacity-10 text-center">Waiting for search...</p>
        </div>
      )}
    </div>
  );
}
