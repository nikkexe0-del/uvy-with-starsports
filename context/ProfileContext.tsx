import React, { createContext, useContext, useState, useEffect } from 'react';

export const NETFLIX_AVATARS = [
  'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
  'https://ih0.redbubble.net/image.618427277.3222/flat,1000x1000,075,f.u2.jpg',
  'https://pro2-bar-s3-cdn-cf.myportfolio.com/dddb0c1b4ab622854dd81280840458d3/98032aebff601c1d993e12a0_rw_600.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/64623a33850498.56ba69ac2a6f7.png',
];

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  watchlist: any[]; 
}

const ProfileContext = createContext<any>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedProfiles = localStorage.getItem('netflix_profiles');
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      setProfiles(parsed);
      const active = localStorage.getItem('netflix_activeProfile');
      setActiveProfileId(active || parsed[0].id);
    } else {
      const initProfileList = [{ id: '1', name: 'User', avatar: NETFLIX_AVATARS[0], watchlist: [] }];
      setProfiles(initProfileList);
      setActiveProfileId('1');
      localStorage.setItem('netflix_profiles', JSON.stringify(initProfileList));
      localStorage.setItem('netflix_activeProfile', '1');
    }
    setIsReady(true);
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const saveProfiles = (newProfiles: UserProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('netflix_profiles', JSON.stringify(newProfiles));
  };

  const addProfile = (name: string, avatar: string) => {
    const newProfile = { id: Date.now().toString(), name, avatar, watchlist: [] };
    saveProfiles([...profiles, newProfile]);
    switchProfile(newProfile.id);
  };

  const switchProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('netflix_activeProfile', id);
  };

  const addToWatchlist = (item: any) => {
    if (!activeProfileId) return;
    const newProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        if (!p.watchlist.find((w: any) => w.id === item.id)) {
          return { ...p, watchlist: [item, ...p.watchlist] };
        }
      }
      return p;
    });
    saveProfiles(newProfiles);
  };

  const removeFromWatchlist = (itemId: string | number) => {
    if (!activeProfileId) return;
    const newProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, watchlist: p.watchlist.filter((w: any) => w.id !== itemId) };
      }
      return p;
    });
    saveProfiles(newProfiles);
  };

  const isInWatchlist = (itemId: string | number) => {
    return !!activeProfile?.watchlist.find((w: any) => w.id === itemId);
  };

  if (!isReady) return null;

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, addProfile, switchProfile, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
