import { useEffect, useState } from 'react';
import { fetchHomeContent, TMDBItem } from '../lib/tmdb';
import { MediaCard } from '../components/MediaCard';
import { Loader2, Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROW_CONFIGS = [
  { title: "Trending Bollywood", type: "movie", params: { with_original_language: "hi", sort_by: "popularity.desc" } },
  { title: "Top Rated Hindi Movies", type: "movie", params: { with_original_language: "hi", sort_by: "vote_average.desc", "vote_count.gte": "500" } },
  { title: "Hindi Blockbusters", type: "movie", params: { with_original_language: "hi", sort_by: "revenue.desc" } },
  { title: "Trending Hindi Series", type: "tv", params: { with_original_language: "hi", sort_by: "popularity.desc" } },
  { title: "Top Rated Series", type: "tv", params: { with_original_language: "hi", sort_by: "vote_average.desc", "vote_count.gte": "100" } },
  { title: "Bollywood Romcoms", type: "movie", params: { with_original_language: "hi", with_genres: "35,10749", sort_by: "popularity.desc" } },
  { title: "Bollywood Action", type: "movie", params: { with_original_language: "hi", with_genres: "28", sort_by: "popularity.desc" } },
  { title: "Bollywood Thrillers", type: "movie", params: { with_original_language: "hi", with_genres: "53,9648", sort_by: "popularity.desc" } },
  { title: "Bollywood Comedy", type: "movie", params: { with_original_language: "hi", with_genres: "35", sort_by: "popularity.desc" } },
];

const BollywoodRow = ({ title, type, params }: { title: string; type: 'movie'|'tv'; params: any }) => {
  const [items, setItems] = useState<TMDBItem[]>([]);
  
  useEffect(() => {
    fetchHomeContent(type, params)
      .then(setItems)
      .catch(console.error);
  }, [type, params]);

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic mb-4 flex items-center gap-4">
        {title} <div className="flex-1 h-[1px] bg-white/5" />
      </h2>
      <div className="netflix-row pb-4">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default function Bollywood() {
  const [heroMovie, setHeroMovie] = useState<TMDBItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent('movie', { with_original_language: 'hi', sort_by: 'popularity.desc' })
      .then(hiMovies => {
        const pool = hiMovies.slice(0, 20);
        if (pool.length > 0) {
          setHeroMovie(pool[Math.floor(Math.random() * pool.length)]);
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
      {heroMovie && (
        <div className="relative h-[80vh] md:h-[95vh] w-full">
          <div className="absolute inset-0">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt={heroMovie.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-[20%] md:bottom-[25%] left-4 md:left-12 max-w-lg z-20">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-red-600 text-[10px] font-black uppercase tracking-widest text-white rounded">
                Bollywood Hit
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                Hindi Cinema
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter italic drop-shadow-2xl">
              {heroMovie.title || heroMovie.name}
            </h1>
            <p className="text-sm md:text-base text-zinc-200 line-clamp-3 mb-6 font-medium leading-relaxed drop-shadow-xl">
              {heroMovie.overview}
            </p>
            <div className="flex gap-4">
              <Link to={`/title/${heroMovie.media_type || 'movie'}/${heroMovie.id}`} className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-white/80 transition-all text-sm md:text-base">
                <Play size={18} className="fill-black md:w-5 md:h-5" /> Play
              </Link>
              <Link to={`/title/${heroMovie.media_type || 'movie'}/${heroMovie.id}`} className="flex items-center gap-2 bg-zinc-500/50 text-white px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-zinc-500/70 transition-all text-sm md:text-base backdrop-blur-md">
                <Info size={18} className="md:w-5 md:h-5" /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12 px-4 md:px-12 -mt-16 md:-mt-40 relative z-30 pb-20">
        {ROW_CONFIGS.map((config, idx) => (
          <BollywoodRow key={idx} title={config.title} type={config.type as 'movie'|'tv'} params={config.params} />
        ))}
      </div>
    </div>
  );
}
