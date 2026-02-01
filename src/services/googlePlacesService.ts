import axios from 'axios';
import { getProxyUrl, getGeocodeUrl } from './api';

interface PlacesResponse {
  status?: string;
  results?: unknown[];
}

interface GeocodeResponse {
  lat?: number;
  lng?: number;
  status?: string;
  results?: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const fetchRestaurantsFromGooglePlaces = async (
  lat: number,
  lng: number,
  radius: number,
  keyword: string
): Promise<unknown[]> => {
  const response = await axios.get<PlacesResponse>(getProxyUrl(), {
    params: {
      location: `${lat},${lng}`,
      radius,
      keyword,
      type: 'restaurant',
    },
  });

  if (response.data.status && response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(`Error from Google Places via proxy: ${response.data.status}`);
  }

  return response.data.results ?? [];
};

export const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    const response = await axios.get<GeocodeResponse>(getGeocodeUrl(), {
      params: { address },
    });

    if (response.data?.lat != null && response.data?.lng != null) {
      return { lat: response.data.lat, lng: response.data.lng };
    }

    if (response.data?.status === 'OK' && response.data.results?.[0]) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    }

    return null;
  } catch {
    return null;
  }
};
