import { useState, useRef, useEffect } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { Artwork } from "@/types/artwork";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
  onImageClick?: () => void;
}

const ArtworkCard = ({ artwork, index = 0, onImageClick }: ArtworkCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const imageUrl = artwork.primaryImage || artwork.image_url;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${artwork.title.replace(/[^a-zA-Z0-9]/g, '_')}_${artwork.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `"${artwork.title}" is being downloaded`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image for artwork ${artwork.id}: ${artwork.image_url}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Prefetch the high-res image for faster download
    if (artwork.primaryImage && artwork.primaryImage !== artwork.primaryImageSmall) {
      const highResImg = new Image();
      highResImg.src = artwork.primaryImage;
    }
  };

  if (imageError) {
    return (
      <div 
        ref={cardRef}
        className="bg-gray-100 rounded-lg p-6 text-center animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="text-gray-400 mb-4">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Image unavailable</p>
        </div>
        <h3 className="font-playfair font-semibold text-gray-600 mb-1">
          {artwork.title}
        </h3>
        <p className="text-sm text-gray-500">{artwork.artist}</p>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 animate-scale-in cursor-pointer",
        // Only apply hover effects on non-mobile devices
        !isMobile && "hover:shadow-2xl hover:-translate-y-2",
        !imageLoaded && "animate-pulse"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onImageClick}
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        {/* Loading animation with colorful border */}
        {isInView && !imageLoaded && (
          <div className="absolute inset-0 rounded-t-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
            <div className="absolute inset-0 rounded-t-xl border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-border animate-spin-slow">
              <div className="w-full h-full bg-gray-200 rounded-t-lg"></div>
            </div>
          </div>
        )}
        
        {isInView && (
          <img
            ref={imgRef}
            src={artwork.primaryImageSmall || artwork.image_url}
            alt={artwork.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 relative z-10",
              // Only apply hover scale on non-mobile devices
              !isMobile && "group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Overlay - only show on hover for non-mobile, always visible on mobile */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 z-20",
          isMobile ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )} />
        
        {/* Download Button - always visible on mobile, hover on desktop */}
        <button
          onClick={handleDownload}
          className={cn(
            "absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 z-30",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Download className="h-5 w-5 text-museum-navy" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="font-playfair font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {artwork.title}
        </h3>
        <p className="text-gray-600 font-inter mb-1">{artwork.artist}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{artwork.year}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {artwork.department}
          </span>
        </div>
        
        {/* Museum Link */}
        <a
          href={artwork.object_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-museum-navy hover:text-museum-gold font-inter text-sm font-medium transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          View at Met Museum →
        </a>
      </div>
    </div>
  );
};

export default ArtworkCard;
