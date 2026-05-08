
export interface Channel {
  name: string;
  url: string;
  logo: string;
  group: string;
  source?: string;
}

export const IPTV_SOURCES = {
  jio: 'https://raw.githubusercontent.com/joiptv/jojo/main/Clarity.m3u',
  global: 'https://iptv-org.github.io/iptv/index.m3u',
  india: 'https://raw.githubusercontent.com/iptv-org/iptv/18c2ef85dd0e25e1f3fa20b70ab9623604052a30/streams/in.m3u',
  bd: 'https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/BD.m3u',
  zilla: 'https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/combined-playlist.m3u',
  amaze: 'https://raw.githubusercontent.com/amazeyourself/m3u/refs/heads/main/jtv.m3u',
  main_all: 'https://raw.githubusercontent.com/atanuroy22/iptv/main/output/all.m3u',
  main_sports: 'https://raw.githubusercontent.com/atanuroy22/iptv/main/output/sports.m3u',
  main_news: 'https://raw.githubusercontent.com/atanuroy22/iptv/main/output/news.m3u',
  main_zee: 'https://raw.githubusercontent.com/atanuroy22/iptv/main/output/zee.m3u',
  grey_alt: 'https://raw.githubusercontent.com/sportlive18/above18/main/alt-m3u8.json',
  grey_m3u8: 'https://raw.githubusercontent.com/sportlive18/above18/main/m3u8.json',
  grey_ullu: 'https://raw.githubusercontent.com/sportlive18/above18/main/ullu-m3u8.json',
};

export async function fetchAndParseSource(url: string, sourceName?: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    
    if (url.endsWith('.json')) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.videos || data.channels || data.data || data.list || data.streams || data.items || []);
      return list.map((v: any) => ({
        name: v.title || v.name || v.label || v.channelName || 'Unknown',
        logo: v.thumbnail || v.logo || v.image || v.poster || v.thumbnail_url || '',
        url: v.stream_url || v.url || v.link || v.streamLink || '',
        group: sourceName?.startsWith('grey') ? 'Grey TV' : (v.group || sourceName || 'General'),
        source: sourceName?.startsWith('grey') ? 'grey' : sourceName
      }));
    }

    const text = await response.text();
    return parseM3U(text, sourceName);
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    return [];
  }
}

export function parseM3U(data: string, sourceName?: string): Channel[] {
  const lines = data.split('\n');
  const parsedChannels: Channel[] = [];
  let currentChannel: Partial<Channel> = { source: sourceName };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.*)$/);
      const name = nameMatch ? nameMatch[1] : 'Unknown';
      
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      const logo = logoMatch ? logoMatch[1] : '';
      
      const groupMatch = line.match(/group-title="(.*?)"/);
      const group = groupMatch ? groupMatch[1] : (sourceName || 'General');

      currentChannel = { ...currentChannel, name, logo, group };
    } else if (line.startsWith('http')) {
      currentChannel.url = line;
      if (currentChannel.name) {
        parsedChannels.push(currentChannel as Channel);
      }
      currentChannel = { source: sourceName };
    }
  }
  return parsedChannels;
}

let cachedChannels: Channel[] | null = null;

export async function getAllIPTVChannels(): Promise<Channel[]> {
  if (cachedChannels) return cachedChannels;

  const promises = Object.entries(IPTV_SOURCES).map(([key, url]) => fetchAndParseSource(url, key));
  const results = await Promise.all(promises);
  cachedChannels = results.flat();
  return cachedChannels;
}

export async function searchAllIPTVChannels(query: string): Promise<Channel[]> {
  const channels = await getAllIPTVChannels();
  const searchLower = query.toLowerCase();
  return channels.filter(c => 
    c.name.toLowerCase().includes(searchLower) ||
    c.group.toLowerCase().includes(searchLower)
  );
}
