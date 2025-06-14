
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import ArtworkCard from "@/components/ArtworkCard";
import LoadingGrid from "@/components/LoadingGrid";
import Footer from "@/components/Footer";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";
import { getDailyCollection, getTodayDate, formatDisplayDate } from "@/utils/metApi";
import { ArrowDown, Calendar } from "lucide-react";

const Detail = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || getTodayDate();
  const [fullScreenIndex, setFullScreenIndex] = useState<number | null>(null);

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['daily-collection', dateParam],
    queryFn: () => getDailyCollection(dateParam),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });

  const handleImageClick = (index: number) => {
    setFullScreenIndex(index);
  };

  const handleCloseFullScreen = () => {
    setFullScreenIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-museum-cream via-white to-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Breadcrumb */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center space-x-2 text-sm font-inter text-gray-600 mb-6">
            <Link to="/" className="hover:text-museum-navy transition-colors">
              Today
            </Link>
            <span>→</span>
            <Link to="/calendar" className="hover:text-museum-navy transition-colors">
              Calendar
            </Link>
            <span>→</span>
            <span className="text-museum-navy font-medium">
              {formatDisplayDate(dateParam)}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-museum-navy mb-4">
                Daily Collection
              </h1>
              <p className="text-xl text-gray-600 font-inter mb-2">
                {formatDisplayDate(dateParam)}
              </p>
              <p className="text-gray-600 font-inter max-w-2xl">
                Ten carefully selected artworks from The Metropolitan Museum of Art, 
                chosen specifically for this date. Click any artwork to view it in full screen 
                or download it in high resolution for your personal collection.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0">
              <Link
                to="/calendar"
                className="inline-flex items-center space-x-2 bg-museum-navy text-white px-6 py-3 rounded-lg font-inter font-medium hover:bg-museum-gold transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <Calendar className="h-5 w-5" />
                <span>Browse Other Days</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && <LoadingGrid />}
        
        {error && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="font-playfair font-semibold text-red-800 mb-2">
                Unable to Load Collection
              </h3>
              <p className="text-red-600 font-inter text-sm mb-4">
                We couldn't retrieve the artworks for this date. This might be due to 
                a connection issue or temporary unavailability of the museum's API.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center space-x-2 text-red-700 hover:text-red-800 font-inter font-medium"
              >
                <span>Try Another Date</span>
                <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
              </Link>
            </div>
          </div>
        )}
        
        {collection && collection.images.length > 0 && (
          <>
            {/* Single column layout for large images */}
            <div className="space-y-8">
              {collection.images.map((artwork, index) => (
                <div key={artwork.id} className="max-w-2xl mx-auto">
                  <ArtworkCard
                    artwork={artwork}
                    index={index}
                    onImageClick={() => handleImageClick(index)}
                  />
                </div>
              ))}
            </div>

            {/* Collection Stats */}
            <div className="mt-16 bg-white rounded-xl shadow-lg p-8 animate-fade-in">
              <h3 className="text-2xl font-playfair font-semibold text-museum-navy mb-6 text-center">
                Collection Details
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-museum-gold mb-2">
                    {collection.images.length}
                  </div>
                  <p className="text-gray-600 font-inter">Artworks</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-museum-gold mb-2">
                    {new Set(collection.images.map(img => img.department)).size}
                  </div>
                  <p className="text-gray-600 font-inter">Departments</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-museum-gold mb-2">
                    {new Set(collection.images.map(img => img.artist)).size}
                  </div>
                  <p className="text-gray-600 font-inter">Artists</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 font-inter text-sm">
                  All images are available in high resolution for download. 
                  Each artwork links directly to its page on The Metropolitan Museum of Art website 
                  for detailed information and provenance.
                </p>
              </div>
            </div>
          </>
        )}

        {collection && collection.images.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="font-playfair font-semibold text-yellow-800 mb-2">
                No Artworks Available
              </h3>
              <p className="text-yellow-600 font-inter text-sm mb-4">
                No artworks were curated for this specific date. This can happen when 
                the museum's collection doesn't have suitable pieces available through their API.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center space-x-2 text-yellow-700 hover:text-yellow-800 font-inter font-medium"
              >
                <span>Browse Other Dates</span>
                <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Full Screen Image Viewer */}
      {collection && fullScreenIndex !== null && (
        <FullScreenImageViewer
          artworks={collection.images}
          currentIndex={fullScreenIndex}
          isOpen={fullScreenIndex !== null}
          onClose={handleCloseFullScreen}
        />
      )}
    </div>
  );
};

export default Detail;
