
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ArtworkCard from "@/components/ArtworkCard";
import LoadingGrid from "@/components/LoadingGrid";
import { getDailyCollection, getTodayDate, formatDisplayDate } from "@/utils/metApi";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const Index = () => {
  const today = getTodayDate();
  
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['daily-collection', today],
    queryFn: () => getDailyCollection(today),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-museum-cream via-white to-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-museum-navy mb-4">
            Today's Collection
          </h1>
          <p className="text-xl text-gray-600 font-inter mb-2">
            {formatDisplayDate(today)}
          </p>
          <p className="text-gray-600 font-inter max-w-2xl mx-auto">
            Discover five carefully curated artworks from The Metropolitan Museum of Art's 
            extensive collection. Each piece is selected to inspire and beautify your day.
          </p>
          
          <div className="mt-8">
            <Link
              to="/calendar"
              className="inline-flex items-center space-x-2 bg-museum-navy text-white px-6 py-3 rounded-lg font-inter font-medium hover:bg-museum-gold transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              <Calendar className="h-5 w-5" />
              <span>Browse Previous Days</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading && <LoadingGrid />}
        
        {error && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="font-playfair font-semibold text-red-800 mb-2">
                Unable to Load Today's Collection
              </h3>
              <p className="text-red-600 font-inter text-sm">
                Please check your connection and try refreshing the page.
              </p>
            </div>
          </div>
        )}
        
        {collection && collection.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {collection.images.map((artwork, index) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                index={index}
              />
            ))}
          </div>
        )}

        {collection && collection.images.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="font-playfair font-semibold text-yellow-800 mb-2">
                No Artworks Available Today
              </h3>
              <p className="text-yellow-600 font-inter text-sm">
                We're working to curate new pieces. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 text-center border-t border-gray-200 pt-12 animate-fade-in">
          <p className="text-gray-600 font-inter text-sm max-w-2xl mx-auto">
            All artworks are from The Metropolitan Museum of Art's Open Access collection. 
            Images are provided for personal use and appreciation of art. New collections 
            are automatically curated daily at midnight.
          </p>
          <a
            href="https://metmuseum.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-museum-navy hover:text-museum-gold font-inter font-medium transition-colors duration-200"
          >
            Visit The Metropolitan Museum of Art →
          </a>
        </div>
      </main>
    </div>
  );
};

export default Index;
