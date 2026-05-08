import React from 'react';
import { Link } from 'react-router-dom';
import { TMDBItem } from '../lib/tmdb';
import { Play, Plus, Info, Check } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

interface MediaCardProps {
  item: TMDBItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useProfile();
  const inList = isInWatchlist(item.id);

  return (
    <div className="netflix-card flex-none w-32 md:w-52 relative group">
      <Link to={`/title/${item.media_type || 'movie'}/${item.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 border border-white/5">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="netflix-card-overlay flex flex-col justify-end p-4">
            <div className="flex gap-2 mb-3">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-zinc-200 transition-colors">
                  <Play size={16} className="fill-black" />
               </div>
               <div 
                 onClick={(e) => {
                   e.preventDefault();
                   if (inList) removeFromWatchlist(item.id);
                   else addToWatchlist(item);
                 }}
                 className="w-8 h-8 rounded-full bg-zinc-800 border border-white/30 flex items-center justify-center text-white hover:border-white transition-colors cursor-pointer"
               >
                  {inList ? <Check size={16} /> : <Plus size={16} />}
               </div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/30 flex items-center justify-center text-white ml-auto hover:border-white transition-colors">
                  <Info size={16} />
               </div>
            </div>
            <p className="text-white text-xs font-bold line-clamp-2 leading-tight">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              {rating && <span className="text-green-500 font-bold text-[10px]">{Math.min(99, Math.floor((Number(rating) / 10) * 100 + (Math.random() * 10 - 5)))}% Match</span>}
              <span className="text-white/60 text-[10px]">{year}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
