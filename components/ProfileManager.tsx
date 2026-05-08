import React, { useState } from 'react';
import { useProfile, NETFLIX_AVATARS } from '../context/ProfileContext';
import { Loader2 } from 'lucide-react';

export default function ProfileManager() {
  const { profiles, switchProfile, addProfile, activeProfile } = useProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(NETFLIX_AVATARS[0]);

  if (!profiles) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addProfile(newName.trim(), selectedAvatar);
      setIsCreating(false);
      setNewName('');
    }
  };

  if (isCreating) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-white text-3xl md:text-5xl font-black mb-8">Add Profile</h1>
        <form onSubmit={handleCreate} className="flex flex-col items-center gap-6 max-w-md w-full">
          <div className="flex gap-4 mb-4">
            {NETFLIX_AVATARS.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar}
                alt="Avatar option"
                className={`w-16 h-16 rounded-md cursor-pointer border-2 transition-all ${
                  selectedAvatar === avatar ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              />
            ))}
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full bg-[#141414] border border-zinc-600 text-white px-4 py-3 rounded outline-none focus:border-white transition-colors"
            autoFocus
          />
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-8 py-2 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-zinc-200 disabled:opacity-50"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-8 py-2 border border-zinc-600 text-zinc-400 font-bold uppercase tracking-widest rounded hover:border-white hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-3xl md:text-5xl font-black mb-12">Who's watching?</h1>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {profiles.map((profile: any) => (
          <div
            key={profile.id}
            onClick={() => switchProfile(profile.id)}
            className="flex flex-col items-center gap-4 cursor-pointer group"
          >
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden border-2 transition-all duration-300 ${activeProfile?.id === profile.id ? 'border-white scale-105 shadow-2xl' : 'border-transparent group-hover:border-white group-hover:scale-105'}`}>
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <span className={`text-sm md:text-base font-medium transition-colors ${activeProfile?.id === profile.id ? 'text-white font-bold' : 'text-zinc-400 group-hover:text-white'}`}>
              {profile.name}
            </span>
          </div>
        ))}
        {profiles.length < 5 && (
          <div
            onClick={() => setIsCreating(true)}
            className="flex flex-col items-center gap-4 cursor-pointer group"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden border-2 border-transparent group-hover:bg-white group-hover:text-black bg-zinc-900 border-zinc-700 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <span className="text-5xl md:text-7xl font-light">+</span>
            </div>
            <span className="text-sm md:text-base font-medium text-zinc-400 group-hover:text-white transition-colors">
              Add Profile
            </span>
          </div>
        )}
      </div>
      <button 
        onClick={() => {}}
        className="mt-16 px-8 py-2 border border-zinc-600 text-zinc-400 font-medium uppercase tracking-widest hover:border-white hover:text-white transition-colors uppercase text-sm"
      >
        Manage Profiles
      </button>
    </div>
  );
}
