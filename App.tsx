import { BrowserRouter, Routes, Route, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, Film, Tv, MonitorPlay, Globe, MoreVertical, X, Instagram, ExternalLink as ExtIcon, User, LogOut } from 'lucide-react';

import Home from './pages/Home';
import Details from './pages/Details';
import SearchPage from './pages/Search';
import South from './pages/South';
import Hollywood from './pages/Hollywood';
import Bollywood from './pages/Bollywood';
import StarSportsIndex from './pages/StarSportsIndex';
import StarSportsWatch from './pages/StarSportsWatch';
import LiveTV from './pages/LiveTV';
import GreyTV from './pages/GreyTV';
import IPLHighlights from './pages/IPLHighlights';
import Watchlist from './pages/Watchlist';
import ProfileManager from './components/ProfileManager';

import { ProfileProvider, useProfile } from './context/ProfileContext';

function LoadingOverlay() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-7xl font-serif italic uppercase tracking-widest animate-shimmer"
          >
            uvy
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-black/90 border-t border-white/5 py-12 px-4 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">
        <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-[3px]">
          Developed and maintained by <span className="text-white text-base">speednikk</span>
        </p>
        <a 
          href="https://instagram.com/nikkk.exe" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-zinc-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Instagram size={12} /> Suggestions @nikkk.exe
        </a>
        <a 
          href="https://zestyyflix.vercel.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-white/5 hover:bg-white text-white hover:text-black px-8 py-4 rounded-full transition-all duration-500 border border-white/10"
        >
          <span className="text-xs font-black uppercase tracking-[4px]">For More Content</span>
          <ExtIcon size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
      <div className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-[8px] text-zinc-800 font-bold uppercase tracking-[10px]">© {new Date().getFullYear()} UVY NETWORK • ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { activeProfile, switchProfile } = useProfile();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/bollywood', label: 'Bollywood' },
    { path: '/hollywood', label: 'Hollywood' },
    { path: '/south', label: 'South' },
    { path: '/grey', label: 'Grey' },
    { path: '/star-sports', label: 'Star Sports' },
    { path: '/live-tv', label: 'Live TV' },
    { path: '/ipl', label: 'IPL' },
    { path: '/watchlist', label: 'My Watchlist' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || (path !== '/' && location.pathname.includes(path));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-4 md:px-12 py-4 flex items-center justify-between transition-colors duration-400 ${isScrolled ? 'bg-black shadow-lg shadow-black/20' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center">
          <Link to="/" className="text-white text-3xl font-serif italic tracking-tighter mr-8 shrink-0">uvy</Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`${isActive(link.path) ? 'text-white font-bold' : 'text-zinc-300 hover:text-zinc-400'} transition-all`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-black/40 border border-white/20 rounded-full px-4 py-1.5 transition-all focus-within:border-white/50 focus-within:w-64 w-40">
             <Search size={16} className="text-white shrink-0" />
             <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-[11px] text-white placeholder-white/50 focus:outline-none w-full ml-2 font-bold uppercase tracking-wider"
             />
          </form>

          {/* Search Icon for Mobile */}
          <button 
            onClick={() => navigate('/search')}
            className={`p-2 text-white hover:bg-white/10 rounded-full transition-colors sm:hidden ${location.pathname === '/search' ? 'bg-white/20' : ''}`}
          >
            <Search size={22} />
          </button>

          {activeProfile && (
            <div className="relative" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
              <div className="flex items-center gap-2 cursor-pointer">
                 <img src={activeProfile.avatar} alt="Profile" className="w-8 h-8 rounded" />
                 <span className="hidden md:block text-sm font-medium">{activeProfile.name}</span>
              </div>
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-black border border-zinc-800 rounded py-2 flex flex-col z-50">
                   <button onClick={() => switchProfile('')} className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:underline w-full text-left">
                     <LogOut size={16} /> Switch Profiles
                   </button>
                   <Link to="/watchlist" className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:underline w-full text-left">
                     <Film size={16} /> My Watchlist
                   </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-white hover:text-zinc-300 transition-colors lg:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
          </button>
        </div>

        {/* Mobile Flyout Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[80%] max-w-xs bg-zinc-950 border-l border-white/10 z-[70] p-8 flex flex-col gap-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-2xl font-serif italic tracking-tighter">uvy</span>
                  <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500 hover:text-white p-2">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path}
                      to={link.path} 
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-xl font-black uppercase tracking-widest py-2 border-b border-white/5 ${isActive(link.path) ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button 
                    onClick={() => { switchProfile(''); setIsMenuOpen(false); }} 
                    className="text-xl font-black uppercase tracking-widest py-2 text-zinc-500 hover:text-white text-left mt-4 border-b border-white/5"
                  >
                    SWITCH PROFILE
                  </button>
                  
                  <div className="mt-8 flex flex-col gap-4 pt-8 border-t border-white/10">
                    <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <Search size={18} className="text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="SEARCH..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-xs text-white placeholder-zinc-700 focus:outline-none ml-2 uppercase font-black"
                      />
                    </form>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[4px] leading-tight">developed by speednikk</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative pt-0 min-h-screen">
        {!activeProfile ? <ProfileManager /> : <Outlet />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <LoadingOverlay />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="bollywood" element={<Bollywood />} />
            <Route path="south" element={<South />} />
            <Route path="hollywood" element={<Hollywood />} />
            <Route path="star-sports" element={<StarSportsIndex />} />
            <Route path="live-tv" element={<LiveTV />} />
            <Route path="grey" element={<GreyTV />} />
            <Route path="ipl" element={<IPLHighlights />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="title/:type/:id" element={<Details />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
          <Route path="star-sports/channel/:id" element={<StarSportsWatch />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}
