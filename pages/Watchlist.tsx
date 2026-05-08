import React from 'react';
import { useProfile } from '../context/ProfileContext';
import { MediaCard } from '../components/MediaCard';

export default function Watchlist() {
  const { activeProfile } = useProfile();

  if (!activeProfile) return null;

  return (
    <div className="w-full min-h-screen bg-black pt-28 px-4 md:px-12 pb-20">
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-8">
        My Watchlist
      </h1>
      
      {activeProfile.watchlist.length === 0 ? (
        <div className="text-zinc-500 font-bold uppercase tracking-widest text-center py-20 flex flex-col items-center gap-4">
          <span className="opacity-50">Your watchlist is currently empty.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {activeProfile.watchlist.map((item: any) => (
            <div key={item.id} className="relative group">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
