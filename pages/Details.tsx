import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetails, TMDBItem, tmdbFetch } from '../lib/tmdb';
import { Share2, Play, Loader2, Star, Calendar, Globe, User, Info, X, Plus, Check } from 'lucide-react';
import { MediaCard } from '../components/MediaCard';
import { useProfile } from '../context/ProfileContext';

export default function Details() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useProfile();
  
  useEffect(() => {
    if (!type || !id) return;
    setLoading(true);
    getDetails(type, id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type, id]);

  useEffect(() => {
    if (type === 'tv' && id && season) {
      tmdbFetch(`/tv/${id}/season/${season}`)
        .then((res: any) => {
          if (res && res.episodes) {
            setSeasonEpisodes(res.episodes);
          }
        })
        .catch(console.error);
    }
  }, [type, id, season]);

  const handleShare = async () => {
    if (!data) return;
    const shareData = {
      title: `${data.title || data.name} on uvy`,
      text: data.overview,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const [showPlayer, setShowPlayer] = useState(false);

  const getIframeUrl = () => {
    if (type === 'movie') {
      return `https://vidfast.pro/movie/${id}?theme=2980B9&autoPlay=true`;
    }
    return `https://vidfast.pro/tv/${id}/${season}/${episode}?nextButton=true&autoNext=true&autoPlay=true`;
  };

  const handlePlay = () => {
    setShowPlayer(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-netflix-red" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-white/50">Content not found.</div>;
  }

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date || '').split('-')[0];
  const cast = data.credits?.cast?.slice(0, 15) || [];
  const recommendations = data.recommendations?.results || [];

  return (
    <div className="w-full pb-20 bg-black min-h-screen">
      {/* Hero Header Section */}
      <div className="relative w-full">
        {showPlayer ? (
          <div className="aspect-video w-full bg-black relative z-50">
            <iframe 
              src={getIframeUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
            <button 
              onClick={() => setShowPlayer(false)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-white text-white hover:text-black p-2 rounded-full backdrop-blur-md transition-all z-50"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="relative h-[60vh] md:h-[80vh] w-full">
            <div className="absolute inset-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-20 flex flex-col gap-6">
               <div className="flex flex-col gap-4 max-w-4xl">
                  <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic drop-shadow-2xl text-white">{title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-black uppercase tracking-[2px] text-zinc-300">
                     <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded backdrop-blur-md">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-white">{data.vote_average?.toFixed(1)}</span>
                     </div>
                     <span className="flex items-center gap-1"><Calendar size={14} /> {releaseYear}</span>
                     <span className="flex items-center gap-1"><Globe size={14} /> {data.original_language}</span>
                     {type === 'tv' && <span className="bg-netflix-red text-white px-2 py-1 rounded text-[10px]">Series</span>}
                  </div>
                  <p className="text-sm md:text-lg text-zinc-300 line-clamp-3 md:line-clamp-none font-medium leading-relaxed max-w-2xl drop-shadow-xl">
                    {data.overview}
                  </p>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-4">
                  <button 
                    onClick={handlePlay}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-white text-black px-12 py-4 rounded-md font-black uppercase tracking-[2px] hover:bg-zinc-200 transition-all shadow-2xl"
                  >
                    <Play size={20} className="fill-black" /> Click to Play
                  </button>
                  <button 
                    onClick={() => {
                      if (isInWatchlist(data.id)) {
                        removeFromWatchlist(data.id);
                      } else {
                        addToWatchlist(data);
                      }
                    }}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-md font-black uppercase tracking-[2px] hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                  >
                    {isInWatchlist(data.id) ? (
                      <><Check size={20} /> In My List</>
                    ) : (
                      <><Plus size={20} /> My List</>
                    )}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-md font-black uppercase tracking-[2px] hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                  >
                    <Share2 size={20} /> Share
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 md:px-12 mt-10 md:mt-10 flex flex-col gap-16 relative z-30">
        
        {/* Season/Episode Controls for TV */}
        {type === 'tv' && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
               <h3 className="text-xl font-black uppercase tracking-[4px] text-white mb-2 flex items-center gap-4">
                 Select Season <div className="flex-1 h-[1px] bg-white/5" />
               </h3>
               {data.seasons && data.seasons.length > 0 ? (
                 <div className="flex flex-wrap gap-4">
                   {data.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                     <button
                       key={s.id}
                       onClick={() => setSeason(s.season_number)}
                       className={`px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all border ${season === s.season_number ? 'bg-white text-black border-white' : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-white'}`}
                     >
                       Season {s.season_number}
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-black text-zinc-600">Season</span>
                    <input 
                      type="number" min="1" max={data.number_of_seasons || 20} value={season} 
                      onChange={(e) => setSeason(parseInt(e.target.value) || 1)}
                      className="bg-transparent text-white text-4xl font-black w-24 outline-none border-b-2 border-red-600 pb-1"
                    />
                 </div>
               )}
            </div>

            {seasonEpisodes.length > 0 && (
              <section>
                <h2 className="text-xl font-black uppercase tracking-[4px] text-white mb-8 flex items-center gap-4">
                  Episodes <div className="flex-1 h-[1px] bg-white/5" />
                </h2>
                <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x">
                  {seasonEpisodes.map((ep: any) => (
                    <div 
                      key={ep.id} 
                      className={`flex flex-col gap-3 snap-start shrink-0 w-64 md:w-80 cursor-pointer group ${episode === ep.episode_number ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                      onClick={() => setEpisode(ep.episode_number)}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-900 border border-white/10">
                        {ep.still_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w500${ep.still_path}`} 
                            alt={ep.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                           <Play className={`w-12 h-12 ${episode === ep.episode_number ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-white/0 group-hover:text-white shadow-xl'} transition-all duration-300`} fill="currentColor" />
                        </div>
                        {ep.runtime && (
                          <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[10px] font-bold rounded text-white">
                            {ep.runtime}m
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{ep.episode_number}. {ep.name}</h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{ep.overview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Cast Section - Horizontal Scroll */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-xl font-black uppercase tracking-[4px] text-white mb-8 flex items-center gap-4">
              Leading Cast <div className="flex-1 h-[1px] bg-white/5" />
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {cast.map((actor: any) => (
                <div key={actor.id} className="flex flex-col items-center gap-3 snap-start shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-zinc-900 border border-white/10 group cursor-pointer relative">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                        alt={actor.name} 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/10 text-2xl font-black">{actor.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="text-center max-w-[100px] md:max-w-[130px]">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-tight text-white leading-tight">{actor.name}</p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase truncate mt-1">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* More Like This - 2x2 side by side scroll */}
        {recommendations.filter((item: any) => {
          const dateStr = item.release_date || item.first_air_date || '';
          if (!dateStr) return false;
          const year = parseInt(dateStr.split('-')[0], 10);
          return year >= (new Date().getFullYear() - 8);
        }).length > 0 && (
          <section>
            <h2 className="text-xl font-black uppercase tracking-[4px] text-white mb-8 flex items-center gap-4">
              More Like This <div className="flex-1 h-[1px] bg-white/5" />
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-10 no-scrollbar snap-x">
              <div className="grid grid-rows-2 grid-flow-col gap-4">
                {recommendations
                  .filter((item: any) => {
                    const dateStr = item.release_date || item.first_air_date || '';
                    if (!dateStr) return false;
                    const year = parseInt(dateStr.split('-')[0], 10);
                    return year >= (new Date().getFullYear() - 8);
                  })
                  .map((item: TMDBItem) => (
                  <div key={item.id} className="w-[180px] md:w-[240px] snap-start">
                    <MediaCard item={{...item, media_type: type}} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
