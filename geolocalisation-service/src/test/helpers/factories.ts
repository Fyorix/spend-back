import { Coordinate } from '../../domain/geocoding/geocoding.provider.js';
import { jest } from '@jest/globals';

export interface GoogleMapsGeocodeResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
}

export interface GoogleMapsAutocompleteResponse {
  predictions: {
    description: string;
  }[];
}

export interface OsmGeocodeResponse {
  lat: string;
  lon: string;
}

export interface OsmAutocompleteResponse {
  display_name: string;
}

export const createCoordinate = (
  overrides?: Partial<Coordinate>,
): Coordinate => ({
  latitude: 48.8566,
  longitude: 2.3522,
  ...overrides,
});

export const createGoogleMapsGeocodeResponse = (
  overrides?: Partial<GoogleMapsGeocodeResponse>,
): GoogleMapsGeocodeResponse =>
  ({
    results: [
      {
        geometry: {
          location: {
            lat: 48.8566,
            lng: 2.3522,
          },
        },
      },
      ...(overrides?.results || []),
    ],
    ...overrides,
  }) as GoogleMapsGeocodeResponse;

export const createGoogleMapsAutocompleteResponse = (
  predictions: string[] = ['Paris, France'],
): GoogleMapsAutocompleteResponse => ({
  predictions: predictions.map((description) => ({ description })),
});

export const createOsmGeocodeResponse = (
  lat = '48.8566',
  lon = '2.3522',
): OsmGeocodeResponse[] => [
    {
      lat,
      lon,
    },
  ];

export const createOsmAutocompleteResponse = (
  suggestions: string[] = ['Paris, France'],
): OsmAutocompleteResponse[] =>
  suggestions.map((display_name) => ({ display_name }));

export const createMockFetchResponse = (
  data:
    | GoogleMapsGeocodeResponse
    | GoogleMapsAutocompleteResponse
    | OsmGeocodeResponse[]
    | OsmAutocompleteResponse[]
    | object,
): Response =>
  ({
    json: jest.fn<() => Promise<unknown>>().mockResolvedValue(data),
    ok: true,
    status: 200,
    statusText: 'OK',
  }) as unknown as Response;

import { GeolocalisationModel } from '../../infrastructure/database/models/geolocalisation.model.js';

export const createGeolocalisationEntity = (
  overrides?: Partial<GeolocalisationModel>,
): GeolocalisationModel => {
  const entity = new GeolocalisationModel();
  entity.id = 'uuid-1';
  entity.transactionId = 'tx-1';
  entity.location = {
    type: 'Point',
    coordinates: [2.3522, 48.8566],
  };
  entity.amount = 100;
  entity.createdAt = new Date();
  entity.updatedAt = new Date();
  return Object.assign(entity, overrides);
};
