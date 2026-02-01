const HEROKU_BASE = 'https://proxy-server-we-eat-e24e32c11d10.herokuapp.com';
const LOCAL_BASE = 'http://localhost:3000';

const FORCE_HEROKU = true;

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_BASE = FORCE_HEROKU ? HEROKU_BASE : (isLocalhost ? LOCAL_BASE : HEROKU_BASE);

export const apiUrl = (path: string): string => {
  const base = API_BASE.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

export const API_ENDPOINTS = {
  PROXY: '/proxy',
  PHOTO: '/photo',
  GEOCODE: '/geocode',
} as const;

export const getProxyUrl = (): string => apiUrl(API_ENDPOINTS.PROXY);

export const getPhotoUrl = (photoReference: string, maxWidth = 400): string =>
  apiUrl(`${API_ENDPOINTS.PHOTO}?photoreference=${photoReference}&maxwidth=${maxWidth}`);

export const getGeocodeUrl = (): string => apiUrl(API_ENDPOINTS.GEOCODE);
