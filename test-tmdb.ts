const API_KEY = '493e89a3bd3410b312740f113e5a3d13';
const BASE_URL = 'https://api.themoviedb.org/3';
const tmdbFetch = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('include_adult', 'true');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  console.log(url.toString());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API Error: ${res.status} ${await res.text()}`);
  return res.json();
};

const fetchHomeContent = async (type, params = {}) => {
  const dateKey = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const data = await tmdbFetch(`/discover/${type}`, {
    [dateKey]: '2016-01-01',
    sort_by: 'popularity.desc',
    ...params
  });
  return data.results;
};

fetchHomeContent('movie', { with_original_language: 'hi', sort_by: 'popularity.desc' })
  .then(res => console.log('success!', res.length))
  .catch(console.error);
