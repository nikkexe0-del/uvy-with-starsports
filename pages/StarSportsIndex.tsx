import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { parseM3U, type Channel } from "../lib/starsports-playlist";

const PLAYLIST_URL = "https://m3u-tvb.pages.dev/ixp.m3u";

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const parts = text.split(
    new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-red-600 text-white rounded-[2px] px-0.5 font-bold">{part}</span>
        ) : (part)
      )}
    </>
  );
};

function ChannelMiniCard({ channel, searchTerm = "", onPlay }: { channel: Channel; searchTerm?: string; onPlay: (c: Channel) => void; }) {
  return (
    <button onClick={() => onPlay(channel)} className="flex flex-col w-full text-left group bg-neutral-900/40 rounded-lg border border-white/5 hover:border-red-500/30 transition-all overflow-hidden p-3">
      <div className="w-full aspect-video bg-neutral-950 rounded-md overflow-hidden relative mb-3">
        <div className="absolute inset-0 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm">
          {channel.logo ? (
            <img src={channel.logo} alt={channel.name} className="max-w-full max-h-[70%] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
          ) : (
            <div className="font-black text-neutral-600 text-[10px] uppercase text-center leading-tight px-2">{channel.name}</div>
          )}
        </div>
        <span className="badge-live absolute top-1.5 right-1.5 z-10 text-[7px]">
          <span className="live-dot" /> LIVE
        </span>
      </div>
      <h5 className="text-[11px] font-bold truncate text-white leading-tight"><HighlightText text={channel.name} highlight={searchTerm} /></h5>
      <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5"><HighlightText text={channel.group || ""} highlight={searchTerm} /></p>
    </button>
  );
}

const StarSportsIndex = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("");

  const handlePlay = (ch: Channel) => navigate(`/star-sports/channel/${ch.id}`);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PLAYLIST_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        setChannels(parseM3U(text));
      } catch (e) {
        setLoadError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => set.add(c.group));
    return Array.from(set).sort();
  }, [channels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      if (activeGroup && c.group !== activeGroup) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.group.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [channels, query, activeGroup]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen text-white font-sans flex flex-col selection:bg-red-600 selection:text-white">
      <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 flex-1 flex flex-col max-w-[1800px] w-full mx-auto">
        {/* Hero */}
        <section className="relative h-[120px] md:h-[260px] w-full rounded-2xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-neutral-900" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-neutral-950/60 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 md:p-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-1 md:mb-3">
              <span className="badge-live text-[8px]"><span className="live-dot" /> LIVE NOW</span>
              <span className="text-neutral-400 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">IPL 2026</span>
            </div>
            <h2 className="text-xl md:text-5xl font-black tracking-tighter leading-none mb-1 md:mb-3">
              EVERY MATCH. <span className="text-red-500">EVERY LANGUAGE.</span>
            </h2>
            <p className="hidden md:block text-neutral-400 text-[11px] md:text-sm font-medium max-w-md">
              Star Sports, Willow &amp; official IPL feeds in Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Marathi, Gujarati and more — in HD and 4K.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-10 mt-2">
          <section>
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search channels — Star Sports, Hindi, 4K…" className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 sm:py-4 pl-12 pr-5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all focus:ring-2 focus:ring-red-500/10" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
              {groups.map((g) => (
                <button key={g} onClick={() => setActiveGroup(activeGroup === g ? "" : g)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${activeGroup === g ? "bg-red-600 text-white border-transparent shadow-lg shadow-red-600/25" : "bg-neutral-900/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20"}`}>{g}</button>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4 text-neutral-500">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading playlist…</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-20 text-red-500 font-bold">Failed to load playlist: {loadError}</div>
          ) : isSearching ? (
            <section>
              <div className="flex items-center gap-4 mb-5">
                <h4 className="text-base sm:text-xl font-extrabold tracking-tighter text-red-500 uppercase italic">Search Results</h4>
                <div className="h-px flex-1 bg-red-500/10" />
                <span className="text-[9px] font-bold text-neutral-600 tracking-widest">{filtered.length} FOUND</span>
              </div>
              {filtered.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-white/5 rounded-[32px]">
                  <p className="text-neutral-600 font-black uppercase tracking-widest text-xs">No channels match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filtered.map((c) => <ChannelMiniCard key={c.id} channel={c} searchTerm={query} onPlay={handlePlay} />)}
                </div>
              )}
            </section>
          ) : (
            <>
              {(activeGroup ? [activeGroup] : groups).map((g) => {
                const gChannels = channels.filter((c) => c.group === g);
                if (gChannels.length === 0) return null;
                return (
                  <section key={g}>
                    <div className="flex items-center gap-4 mb-4">
                      <h4 className="text-base sm:text-xl font-extrabold tracking-tighter text-neutral-100 uppercase">{g}</h4>
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[9px] font-bold text-neutral-600 tracking-widest">{gChannels.length} CHANNELS</span>
                    </div>
                    <div className="flex snap-row gap-4 pb-5 no-scrollbar overflow-x-auto">
                      {gChannels.map((c) => (
                        <div key={c.id} className="w-40 sm:w-48 shrink-0"><ChannelMiniCard channel={c} onPlay={handlePlay} /></div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StarSportsIndex;
