import { useEffect, useState } from 'react';
import { getPopularEnglishMovies, getPopularEnglishSeries, TMDBItem } from '../lib/tmdb';
import { MediaCard } from '../components/MediaCard';
import { Loader2, Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hollywood() {
  const [movies, setMovies] = useState<TMDBItem[]>([]);
  const [shows, setShows] = useState<TMDBItem[]>([]);
  const [heroItem, setHeroItem] = useState<TMDBItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPopularEnglishMovies(), getPopularEnglishSeries()])
      .then(([moviesData, showsData]) => {
        setMovies(moviesData);
        setShows(showsData);
        if (moviesData.length > 0) {
          setHeroItem(moviesData[Math.floor(Math.random() * Math.min(10, moviesData.length))]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-netflix-red" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0">
      {heroItem && (
        <div className="relative h-[80vh] md:h-[95vh] w-full">
          <div className="absolute inset-0">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt={heroItem.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-[20%] md:bottom-[25%] left-4 md:left-12 max-w-lg z-20">
             <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-white rounded">Hollywood Blockbuster</span>
             </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter italic drop-shadow-2xl">{heroItem.title || heroItem.name}</h1>
            <p className="text-sm md:text-base text-zinc-200 line-clamp-3 mb-6 font-medium leading-relaxed drop-shadow-xl">
              {heroItem.overview}
            </p>
            <div className="flex gap-4">
              <Link to={`/title/${heroItem.media_type || 'movie'}/${heroItem.id}`} className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-white/80 transition-all text-sm md:text-base">
                <Play size={18} className="fill-black md:w-5 md:h-5" /> Play
              </Link>
              <Link to={`/title/${heroItem.media_type || 'movie'}/${heroItem.id}`} className="flex items-center gap-2 bg-zinc-500/50 text-white px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-zinc-500/70 transition-all text-sm md:text-base backdrop-blur-md">
                <Info size={18} className="md:w-5 md:h-5" /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12 px-4 md:px-12 -mt-16 md:-mt-40 relative z-30 pb-20">
        <section>
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic mb-4 flex items-center gap-4">
             English Cinema <div className="flex-1 h-[1px] bg-white/5" />
          </h2>
          <div className="netflix-row pb-4">
            {movies.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic mb-4 flex items-center gap-4">
             Top Hollywood Series <div className="flex-1 h-[1px] bg-white/5" />
          </h2>
          <div className="netflix-row pb-4">
            {shows.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
