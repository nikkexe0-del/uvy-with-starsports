import { useEffect, useState, memo } from 'react';
import { fetchHomeContent, TMDBItem } from '../lib/tmdb';
import { MediaCard } from '../components/MediaCard';
import { Loader2, Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const RECENT_DATE = "2020-01-01";

const ROW_CONFIGS = [
  { title: "Trending Now", type: "movie", params: { sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "English Trending Series", type: "tv", params: { with_original_language: "en", sort_by: "popularity.desc", "vote_count.gte": "200", "first_air_date.gte": RECENT_DATE, without_genres: "10766" } },
  { title: "All Time Favorites Indian Series", type: "tv", params: { with_original_language: "hi", sort_by: "vote_average.desc", "vote_count.gte": "50", without_genres: "10766", "first_air_date.gte": "2018-01-01" } },
  { title: "Top Running Indian Series", type: "tv", params: { with_original_language: "hi", sort_by: "popularity.desc", "vote_count.gte": "50", without_genres: "10766", "first_air_date.gte": "2018-01-01" } },
  { title: "Trending Indian Movies", type: "movie", params: { with_original_language: "hi", sort_by: "popularity.desc", "vote_count.gte": "50", "primary_release_date.gte": "2024-01-01" } },
  { title: "Top Rated Movies", type: "movie", params: { sort_by: "vote_average.desc", "vote_count.gte": "1000", "primary_release_date.gte": RECENT_DATE } },
  { title: "Hollywood Blockbusters", type: "movie", params: { with_original_language: "en", sort_by: "revenue.desc", "vote_count.gte": "200", "primary_release_date.gte": RECENT_DATE } },
  { title: "Romcoms", type: "movie", params: { with_genres: "35,10749", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Comedy Hits", type: "movie", params: { with_genres: "35", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Action & Adventure", type: "movie", params: { with_genres: "28", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Thrilling Mysteries", type: "movie", params: { with_genres: "53,9648", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Sci-Fi Epics", type: "movie", params: { with_genres: "878", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Horror Nights", type: "movie", params: { with_genres: "27", sort_by: "popularity.desc", "vote_count.gte": "100", "primary_release_date.gte": RECENT_DATE } },
  { title: "Binge-Worthy Shows", type: "tv", params: { with_original_language: "en", sort_by: "popularity.desc", "vote_count.gte": "300", "first_air_date.gte": "2015-01-01" } },
  { title: "Crime Documentaries", type: "tv", params: { with_genres: "99,80", sort_by: "popularity.desc", "vote_count.gte": "50", "first_air_date.gte": RECENT_DATE } },
  { title: "Critically Acclaimed", type: "movie", params: { "vote_average.gte": "8", sort_by: "vote_count.desc", "primary_release_date.gte": RECENT_DATE } },
];

const HomeRow = memo(({ title, type, params }: { title: string; type: 'movie'|'tv'; params: any }) => {
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
});

export default function Home() {
  const [heroPool, setHeroPool] = useState<TMDBItem[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [visibleRows, setVisibleRows] = useState(5);

  useEffect(() => {
    Promise.all([
      fetchHomeContent('movie', { with_original_language: 'hi', sort_by: 'popularity.desc', "primary_release_date.gte": RECENT_DATE, "vote_count.gte": "50" }),
      fetchHomeContent('tv', { with_original_language: 'hi', sort_by: 'popularity.desc', "first_air_date.gte": "2018-01-01", "vote_count.gte": "50", without_genres: "10766" }),
      fetchHomeContent('movie', { with_original_language: 'en', sort_by: 'popularity.desc', "primary_release_date.gte": RECENT_DATE, "vote_count.gte": "100" }),
      fetchHomeContent('tv', { with_original_language: 'en', sort_by: 'popularity.desc', "first_air_date.gte": RECENT_DATE, "vote_count.gte": "200", without_genres: "10766" })
    ])
      .then(([hiMovies, hiShows, enMovies, enShows]) => {
        const pool = [...hiMovies, ...hiShows, ...enMovies, ...enShows].slice(0, 40);
        if (pool.length > 0) {
          setHeroPool(pool.sort(() => Math.random() - 0.5));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (heroPool.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroPool.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroPool]);

  const heroMovie = heroPool[heroIndex] || null;

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
          setVisibleRows(prev => Math.min(prev + 3, ROW_CONFIGS.length));
        }
      }, 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0 min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative h-[80vh] md:h-[95vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {heroMovie ? (
            <motion.div 
              key={heroMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
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
                    Trending Hit
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                    Global Cinema
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter italic drop-shadow-2xl">
                  {heroMovie.title || heroMovie.name}
                </h1>
                <p className="text-sm md:text-base text-zinc-200 line-clamp-3 mb-6 font-medium leading-relaxed drop-shadow-xl">
                  {heroMovie.overview}
                </p>
                <div className="flex gap-4">
                  <Link to={`/title/${heroMovie.media_type || 'movie'}/${heroMovie.id}`} className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-white/80 transition-all text-sm md:text-base focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                    <Play size={18} className="fill-black" /> Play
                  </Link>
                  <Link to={`/title/${heroMovie.media_type || 'movie'}/${heroMovie.id}`} className="flex items-center justify-center gap-2 bg-zinc-500/50 text-white px-6 md:px-8 py-2 md:py-3 rounded-md font-bold hover:bg-zinc-500/70 transition-all text-sm md:text-base backdrop-blur-md">
                    <Info size={18} /> More Info
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-zinc-900 border-b border-white/10" />
          )}
        </AnimatePresence>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-12 px-4 md:px-12 -mt-16 md:-mt-24 relative z-30 pb-20 pt-8">
        {ROW_CONFIGS.slice(0, visibleRows).map((config, idx) => (
          <HomeRow key={idx} title={config.title} type={config.type as 'movie'|'tv'} params={config.params} />
        ))}
        {visibleRows < ROW_CONFIGS.length && (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          </div>
        )}
      </div>
    </div>
  );
}
