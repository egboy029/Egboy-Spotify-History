import { useState, useEffect, useCallback } from 'react';
import { batchGetTrackImages, batchGetArtistImages } from '../utils/spotifyApi';

interface TrackInfo {
  name: string;
  artist: string;
}

/**
 * Hook to fetch and cache track album images
 */
export function useTrackImages(tracks: TrackInfo[]) {
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (tracks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const imageMap = await batchGetTrackImages(tracks);
      setImages(imageMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [tracks]);

  useEffect(() => {
    // Create a stable key from tracks to detect changes
    const tracksKey = tracks.map(t => `${t.name}:${t.artist}`).join('|');
    
    if (tracksKey && tracks.length > 0) {
      fetchImages();
    }
  }, [tracks.map(t => `${t.name}:${t.artist}`).join('|')]);

  const getImage = useCallback((name: string, artist: string): string | null => {
    return images.get(`${name}:${artist}`) || null;
  }, [images]);

  return { images, getImage, loading, error, refetch: fetchImages };
}

/**
 * Hook to fetch and cache artist images
 */
export function useArtistImages(artistNames: string[]) {
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (artistNames.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const imageMap = await batchGetArtistImages(artistNames);
      setImages(imageMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [artistNames]);

  useEffect(() => {
    // Create a stable key from artist names to detect changes
    const artistsKey = artistNames.join('|');
    
    if (artistsKey && artistNames.length > 0) {
      fetchImages();
    }
  }, [artistNames.join('|')]);

  const getImage = useCallback((artistName: string): string | null => {
    return images.get(artistName) || null;
  }, [images]);

  return { images, getImage, loading, error, refetch: fetchImages };
}

