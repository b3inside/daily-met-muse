
import { MetApiObject, Artwork, DailyCollection } from "@/types/artwork";

const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

// Enhanced cache with localStorage persistence
const CACHE_KEY_PREFIX = "museum_cache_";
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days

// Memory cache for current session
const memoryCache = new Map<string, any>();

// Persistent cache functions
const getCachedData = (key: string): any => {
  // First check memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  
  // Then check localStorage
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.expiry > Date.now()) {
        memoryCache.set(key, data.value);
        return data.value;
      } else {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
      }
    }
  } catch (error) {
    console.warn("Failed to read from cache:", error);
  }
  return null;
};

const setCachedData = (key: string, value: any, expiryDays: number = CACHE_EXPIRY_DAYS): void => {
  // Set in memory cache
  memoryCache.set(key, value);
  
  // Set in localStorage with expiry
  try {
    const cacheData = {
      value,
      expiry: Date.now() + (expiryDays * 24 * 60 * 60 * 1000)
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to write to cache:", error);
  }
};

// Function to get deterministic object IDs for a given date (now truly fixed per date)
const getObjectIdsForDate = async (date: string): Promise<number[]> => {
  const cacheKey = `objectIds-${date}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Get all object IDs from Met API
    const response = await fetch(`${MET_API_BASE}/objects`);
    const data = await response.json();
    
    // Use date as seed for deterministic selection
    const dateNum = new Date(date).getTime();
    const objectIds = data.objectIDs || [];
    
    // Filter for objects that are likely to have images
    const validIds = objectIds.filter((id: number) => id > 1000);
    
    // Create a truly deterministic selection based on the date
    const selectedIds: number[] = [];
    let seed = dateNum % 100000;
    
    // Generate exactly 25 candidate IDs deterministically
    for (let i = 0; i < 25; i++) {
      // Linear congruential generator for deterministic pseudo-random numbers
      seed = (seed * 1103515245 + 12345) % 2147483647;
      const index = Math.abs(seed) % validIds.length;
      const selectedId = validIds[index];
      
      if (!selectedIds.includes(selectedId)) {
        selectedIds.push(selectedId);
      }
    }
    
    // Cache the result for 7 days
    setCachedData(cacheKey, selectedIds, 7);
    return selectedIds;
    
  } catch (error) {
    console.error("Error fetching object IDs:", error);
    // Deterministic fallback based on date
    const dateNum = new Date(date).getTime();
    const baseIds = [437133, 459080, 436535, 459055, 437998, 438821, 459020, 436123, 458945, 437456, 459134, 436789, 458234, 437890, 459087, 458912, 437234, 459156, 436987, 458723, 437612, 459034, 436445, 458867, 437789];
    
    // Shuffle deterministically based on date
    let seed = dateNum % 100000;
    const shuffled = [...baseIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      const j = Math.abs(seed) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }
};

// Function to fetch artwork details with enhanced caching
const fetchArtworkDetails = async (objectId: number): Promise<Artwork | null> => {
  const cacheKey = `artwork-${objectId}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${MET_API_BASE}/objects/${objectId}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch artwork ${objectId}: ${response.status}`);
      return null;
    }
    
    const data: MetApiObject = await response.json();
    
    // Only return artworks with images
    if (!data.primaryImage && !data.primaryImageSmall) {
      return null;
    }
    
    const artwork: Artwork = {
      id: data.objectID,
      title: data.title || "Untitled",
      artist: data.artistDisplayName || "Unknown Artist",
      year: data.objectDate || "Date unknown",
      department: data.department || "Unknown Department",
      image_url: data.primaryImage || data.primaryImageSmall || "",
      object_link: data.objectURL || `https://metmuseum.org/art/collection/search/${data.objectID}`,
      primaryImageSmall: data.primaryImageSmall,
      primaryImage: data.primaryImage,
      objectDate: data.objectDate,
      culture: data.culture,
      medium: data.medium,
      dimensions: data.dimensions
    };
    
    // Preload the small image for faster display
    if (artwork.primaryImageSmall) {
      const img = new Image();
      img.src = artwork.primaryImageSmall;
    }
    
    // Cache artwork for 7 days
    setCachedData(cacheKey, artwork, 7);
    return artwork;
    
  } catch (error) {
    console.error(`Error fetching artwork details for ${objectId}:`, error);
    return null;
  }
};

// Main function to get daily collection - ensuring exactly 10 fixed images per date
export const getDailyCollection = async (date: string): Promise<DailyCollection> => {
  console.log(`Fetching daily collection for ${date}`);
  
  // Check if we have the complete collection cached
  const collectionCacheKey = `collection-${date}`;
  const cachedCollection = getCachedData(collectionCacheKey);
  if (cachedCollection && cachedCollection.images && cachedCollection.images.length === 10) {
    console.log(`Using cached collection for ${date}`);
    return cachedCollection;
  }
  
  const objectIds = await getObjectIdsForDate(date);
  console.log(`Selected object IDs for ${date}:`, objectIds);
  
  const validArtworks: Artwork[] = [];
  
  // Try to get exactly 10 valid artworks
  for (let i = 0; i < objectIds.length && validArtworks.length < 10; i++) {
    const artwork = await fetchArtworkDetails(objectIds[i]);
    if (artwork && artwork.image_url.length > 0) {
      validArtworks.push(artwork);
    }
  }
  
  console.log(`Successfully fetched ${validArtworks.length} artworks for ${date}`);
  
  // If we still don't have 10 images, try with more deterministic fallback IDs
  if (validArtworks.length < 10) {
    console.log(`Only found ${validArtworks.length} artworks, trying fallback IDs...`);
    const dateNum = new Date(date).getTime();
    const fallbackIds = [437133, 459080, 436535, 459055, 437998, 438821, 459020, 436123, 458945, 437456, 459134, 436789, 458234, 437890, 459087, 458912, 437234, 459156, 436987, 458723];
    
    // Make fallback selection deterministic too
    let seed = dateNum % 100000;
    for (let i = 0; i < fallbackIds.length && validArtworks.length < 10; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      const index = Math.abs(seed) % fallbackIds.length;
      const id = fallbackIds[index];
      
      // Skip if we already have this artwork
      if (validArtworks.some(artwork => artwork.id === id)) continue;
      
      const artwork = await fetchArtworkDetails(id);
      if (artwork && artwork.image_url.length > 0) {
        validArtworks.push(artwork);
      }
    }
  }
  
  const finalCollection = {
    date,
    images: validArtworks.slice(0, 10) // Ensure we only return 10 images maximum
  };
  
  // Cache the complete collection for 30 days (longer than individual items)
  if (finalCollection.images.length === 10) {
    setCachedData(collectionCacheKey, finalCollection, 30);
  }
  
  return finalCollection;
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility function to check if a date is in the future
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today
  return date > today;
};
