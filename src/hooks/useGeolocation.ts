import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  // Check if geolocation is supported
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Get current position (wrapped in Promise)
  const getCurrentPosition = useCallback((): Promise<GeolocationState> => {
    return new Promise((resolve) => {
      if (!isSupported) {
        const errorState: GeolocationState = {
          latitude: null,
          longitude: null,
          accuracy: null,
          error: 'Geolocation is not supported by this browser',
          loading: false,
        };
        resolve(errorState);
        return;
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const successState: GeolocationState = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            loading: false,
          };
          setLocation(successState);
          resolve(successState);
        },
        (error) => {
          const errorState: GeolocationState = {
            latitude: null,
            longitude: null,
            accuracy: null,
            error: error.message || 'Failed to get location',
            loading: false,
          };
          setLocation(errorState);
          resolve(errorState);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Always get fresh location
        }
      );
    });
  }, [isSupported]);

  // Request location (called when user allows)
  const requestLocation = useCallback(async (): Promise<GeolocationState> => {
    console.log('📍 Requesting location...');
    const result = await getCurrentPosition();
    console.log('📍 Location request result:', {
      hasLocation: !!(result.latitude && result.longitude),
      error: result.error,
    });
    return result;
  }, [getCurrentPosition]);

  // Watch position (for continuous updates)
  const watchPosition = useCallback((callback: (location: GeolocationState) => void): number | null => {
    if (!isSupported) {
      callback({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Geolocation is not supported',
        loading: false,
      });
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: GeolocationState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        };
        setLocation(newLocation);
        callback(newLocation);
      },
      (error) => {
        const errorState: GeolocationState = {
          latitude: null,
          longitude: null,
          accuracy: null,
          error: error.message || 'Failed to watch location',
          loading: false,
        };
        setLocation(errorState);
        callback(errorState);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return watchId;
  }, [isSupported]);

  // Clear watch
  const clearWatch = useCallback((watchId: number) => {
    if (isSupported && watchId !== null && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  return {
    location,
    requestLocation,
    watchPosition,
    clearWatch,
    isSupported,
  };
};

