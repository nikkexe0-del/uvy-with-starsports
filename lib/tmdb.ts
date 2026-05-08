const API_KEY = '493e89a3bd3410b312740f113e5a3d13';
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  original_language: string;
  vote_average?: number;
}

export const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('include_adult', 'false');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API Error: ${res.status}`);
  return res.json();
};

export const fetchHomeContent = async (type: 'movie' | 'tv', params: Record<string, string> = {}) => {
  const dateKey = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const data = await tmdbFetch(`/discover/${type}`, {
    [dateKey]: '2020-01-01',
    sort_by: 'popularity.desc',
    ...params
  });
  return data.results
    .filter((i: any) => i.backdrop_path && i.poster_path)
    .map((i: any) => ({ ...i, media_type: type }));
};

export const getPopularSeries = async (): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/discover/tv', {
    with_original_language: 'hi',
    sort_by: 'first_air_date.desc',
    'first_air_date.lte': new Date().toISOString().split('T')[0],
    page: '1'
  });
  return data.results
    .map((i: any) => ({ ...i, media_type: 'tv' }));
};

export const getTopRatedSeries = async (): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/tv/top_rated', {
    with_original_language: 'hi',
    page: '1'
  });
  return data.results
    .map((i: any) => ({ ...i, media_type: 'tv' }));
};

export const getAllTimeFavorites = async (): Promise<TMDBItem[]> => {
  // Discover popular Hindi shows with high ratings
  const data = await tmdbFetch('/discover/tv', {
    with_original_language: 'hi',
    sort_by: 'vote_count.desc',
    'vote_average.gte': '8',
    page: '1'
  });
  return data.results
    .map((i: any) => ({ ...i, media_type: 'tv' }));
};

export const getSouthMovies = async (langs: string[] = ['kn', 'te', 'ta', 'ml']): Promise<TMDBItem[]> => {
  const promises = langs.map(lang => 
    tmdbFetch('/discover/movie', {
      with_original_language: lang,
      'primary_release_date.gte': '2020-01-01',
      sort_by: 'popularity.desc',
      page: '1'
    })
  );
  const results = await Promise.all(promises);
  return results.flatMap(r => r.results).map((i: any) => ({ ...i, media_type: 'movie' }))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
};

export const getSouthSeries = async (langs: string[] = ['kn', 'te', 'ta', 'ml']): Promise<TMDBItem[]> => {
  const promises = langs.map(lang => 
    tmdbFetch('/discover/tv', {
      with_original_language: lang,
      'first_air_date.gte': '2018-01-01',
      sort_by: 'popularity.desc',
      page: '1'
    })
  );
  const results = await Promise.all(promises);
  return results.flatMap(r => r.results).map((i: any) => ({ ...i, media_type: 'tv' }))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
};

export const getPopularEnglishMovies = async (): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/discover/movie', {
    with_original_language: 'en',
    sort_by: 'popularity.desc',
    page: '1'
  });
  return data.results.map((i: any) => ({ ...i, media_type: 'movie' }));
};

export const getPopularEnglishSeries = async (): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/discover/tv', {
    with_original_language: 'en',
    sort_by: 'popularity.desc',
    page: '1'
  });
  return data.results.map((i: any) => ({ ...i, media_type: 'tv' }));
};

export const searchHindiContent = async (query: string): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/search/multi', { query, page: '1' });
  // Filter only Hindi content and valid media types
  return data.results.filter((item: TMDBItem) => 
    item.original_language === 'hi' && 
    (item.media_type === 'movie' || item.media_type === 'tv')
  );
};

export const searchContent = async (query: string): Promise<TMDBItem[]> => {
  const data = await tmdbFetch('/search/multi', { query, page: '1' });
  return data.results.filter((item: TMDBItem) => 
    (item.media_type === 'movie' || item.media_type === 'tv')
  );
};

export const getDetails = async (type: 'movie' | 'tv', id: string) => {
  return tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,recommendations' });
};
