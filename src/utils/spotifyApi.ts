// Spotify API configuration
const CLIENT_ID = 'e0449ce6621f43d88a32c5371ead23a8';
const CLIENT_SECRET = '071694694dcf4a318c338eb3e91fac5c';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

interface SearchResponse {
  tracks?: { items: SpotifyTrack[] };
  artists?: { items: SpotifyArtist[] };
}

// Token cache
let cachedToken: SpotifyToken | null = null;

// Image cache to avoid redundant API calls
const imageCache: Map<string, string> = new Map();

/**
 * Get an access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  
  cachedToken = {
    ...data,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000, // Refresh 1 minute before expiry
  };

  return cachedToken!.access_token;
}

/**
 * Search for a track and get its album cover
 */
export async function getTrackImage(trackName: string, artistName: string): Promise<string | null> {
  const cacheKey = `track:${trackName}:${artistName}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const token = await getAccessToken();
    const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return null;
    }

    const data: SearchResponse = await response.json();
    const track = data.tracks?.items[0];

    if (track && track.album.images.length > 0) {
      // Get the medium-sized image (usually 300x300)
      const image = track.album.images[1] || track.album.images[0];
      imageCache.set(cacheKey, image.url);
      return image.url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching track image:', error);
    return null;
  }
}

/**
 * Search for an artist and get their image
 */
export async function getArtistImage(artistName: string): Promise<string | null> {
  const cacheKey = `artist:${artistName}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const token = await getAccessToken();
    const query = encodeURIComponent(artistName);
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return null;
    }

    const data: SearchResponse = await response.json();
    const artist = data.artists?.items[0];

    if (artist && artist.images.length > 0) {
      // Get the medium-sized image (usually 320x320)
      const image = artist.images[1] || artist.images[0];
      imageCache.set(cacheKey, image.url);
      return image.url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching artist image:', error);
    return null;
  }
}

/**
 * Batch fetch images for multiple tracks
 */
export async function batchGetTrackImages(
  tracks: { name: string; artist: string }[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process in parallel with a limit to avoid rate limiting
  const batchSize = 5;
  
  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize);
    const promises = batch.map(async (track) => {
      const key = `${track.name}:${track.artist}`;
      const imageUrl = await getTrackImage(track.name, track.artist);
      if (imageUrl) {
        results.set(key, imageUrl);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < tracks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Batch fetch images for multiple artists
 */
export async function batchGetArtistImages(
  artistNames: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Process in parallel with a limit to avoid rate limiting
  const batchSize = 5;
  
  for (let i = 0; i < artistNames.length; i += batchSize) {
    const batch = artistNames.slice(i, i + batchSize);
    const promises = batch.map(async (artistName) => {
      const imageUrl = await getArtistImage(artistName);
      if (imageUrl) {
        results.set(artistName, imageUrl);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < artistNames.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

