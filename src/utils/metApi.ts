
import { MetApiObject, Artwork, DailyCollection } from "@/types/artwork";

const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

// Cache for storing fetched data
const cache = new Map<string, any>();

// Function to get a deterministic set of object IDs for a given date
const getObjectIdsForDate = async (date: string): Promise<number[]> => {
  const cacheKey = `objectIds-${date}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    // Get all object IDs from Met API
    const response = await fetch(`${MET_API_BASE}/objects`);
    const data = await response.json();
    
    // Use date as seed for pseudo-random selection
    const dateNum = new Date(date).getTime();
    const objectIds = data.objectIDs || [];
    
    // Filter for objects that are likely to have images (skip very low IDs)
    const validIds = objectIds.filter((id: number) => id > 1000);
    
    // Create a deterministic selection based on the date - get more candidates for 10 images
    const selectedIds: number[] = [];
    let seedMultiplier = dateNum % 10000;
    
    // Get 25 candidates to ensure we have enough valid images for 10 final images
    for (let i = 0; i < 25; i++) {
      seedMultiplier = (seedMultiplier * 9301 + 49297) % 233280;
      const index = seedMultiplier % validIds.length;
      const selectedId = validIds[index];
      
      if (!selectedIds.includes(selectedId)) {
        selectedIds.push(selectedId);
      } else {
        // If duplicate, try next index
        const nextIndex = (index + 1) % validIds.length;
        if (!selectedIds.includes(validIds[nextIndex])) {
          selectedIds.push(validIds[nextIndex]);
        }
      }
    }
    
    cache.set(cacheKey, selectedIds);
    return selectedIds;
    
  } catch (error) {
    console.error("Error fetching object IDs:", error);
    // Fallback to more default IDs for 10 images
    return [437133, 459080, 436535, 459055, 437998, 438821, 459020, 436123, 458945, 437456, 459134, 436789, 458234, 437890, 459087, 458912, 437234, 459156, 436987, 458723, 437612, 459034, 436445, 458867, 437789];
  }
};

// Function to fetch artwork details with image preloading
const fetchArtworkDetails = async (objectId: number): Promise<Artwork | null> => {
  const cacheKey = `artwork-${objectId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
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
    
    cache.set(cacheKey, artwork);
    return artwork;
    
  } catch (error) {
    console.error(`Error fetching artwork details for ${objectId}:`, error);
    return null;
  }
};

// Main function to get daily collection - ensuring exactly 10 images
export const getDailyCollection = async (date: string): Promise<DailyCollection> => {
  console.log(`Fetching daily collection for ${date}`);
  
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
  
  // If we still don't have 10 images, try with more fallback IDs
  if (validArtworks.length < 10) {
    console.log(`Only found ${validArtworks.length} artworks, trying fallback IDs...`);
    const fallbackIds = [437133, 459080, 436535, 459055, 437998, 438821, 459020, 436123, 458945, 437456, 459134, 436789, 458234, 437890, 459087, 458912, 437234, 459156, 436987, 458723];
    
    for (let i = 0; i < fallbackIds.length && validArtworks.length < 10; i++) {
      const id = fallbackIds[i];
      // Skip if we already have this artwork
      if (validArtworks.some(artwork => artwork.id === id)) continue;
      
      const artwork = await fetchArtworkDetails(id);
      if (artwork && artwork.image_url.length > 0) {
        validArtworks.push(artwork);
      }
    }
  }
  
  return {
    date,
    images: validArtworks.slice(0, 10) // Ensure we only return 10 images maximum
  };
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
