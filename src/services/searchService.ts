import axios from 'axios';
import { getProxyUrl, getPhotoUrl } from './api';

interface GooglePlaceResult {
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id?: string;
  icon?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
}

export interface SearchResult {
  name: string;
  vicinity: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  placeId?: string;
  distance: number;
  icon?: string;
  photoReference?: string;
  photoUrl: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const cache: Record<string, SearchResult[]> = {};

const EARTH_RADIUS_MILES = 3958.8;
const METERS_PER_MILE = 1609.34;

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const createCacheKey = (location: string, radius: number, keyword: string): string =>
  `${location}|${radius}|${keyword}`;

const formatSearchResult = (result: GooglePlaceResult, userLocation: UserLocation): SearchResult => {
  const distance = result.geometry?.location
    ? haversineDistance(
        userLocation.lat,
        userLocation.lng,
        result.geometry.location.lat,
        result.geometry.location.lng
      )
    : NaN;

  const photoReference = result.photos?.[0]?.photo_reference;

  return {
    name: result.name,
    vicinity: result.vicinity || result.formatted_address || '',
    geometry: result.geometry,
    placeId: result.place_id,
    distance,
    icon: result.icon,
    photoReference,
    photoUrl: photoReference ? getPhotoUrl(photoReference) : '',
  };
};

export const searchRestaurants = async (
  location: string,
  radius: number,
  keyword: string,
  userLocation: UserLocation
): Promise<SearchResult[]> => {
  const cacheKey = createCacheKey(location, radius, keyword);

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const params = {
      location,
      radius: radius * METERS_PER_MILE,
      keyword,
      type: 'restaurant',
      fields: 'name,geometry,icon,photos,vicinity',
    };

    const { data } = await axios.get<{ results?: GooglePlaceResult[] }>(getProxyUrl(), { params });
    const results = data.results || [];

    const formatted = results
      .map(result => formatSearchResult(result, userLocation))
      .filter(item => !isNaN(item.distance) && item.distance <= radius + 1)
      .sort((a, b) => a.distance - b.distance);

    cache[cacheKey] = formatted;
    return formatted;
  } catch {
    return [];
  }
};

export const clearSearchCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};
