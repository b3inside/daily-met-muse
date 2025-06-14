import { useState } from "react";
import { Download, Image } from "lucide-react";
import { Artwork } from "@/types/artwork";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
}

const ArtworkCard = ({ artwork, index = 0 }: ArtworkCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
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

  if (imageError) {
    return (
      <div 
        className="bg-gray-100 rounded-lg p-6 text-center animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="text-gray-400 mb-4">
          <Image className="h-12 w-12 mx-auto mb-2" />
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
      className={cn(
        "group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-scale-in",
        !imageLoaded && "animate-pulse"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
          src={artwork.primaryImageSmall || artwork.image_url}
          alt={artwork.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
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
        >
          View at Met Museum →
        </a>
      </div>
    </div>
  );
};

export default ArtworkCard;
