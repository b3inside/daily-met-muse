
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Artwork } from "@/types/artwork";
import { useToast } from "@/hooks/use-toast";

interface FullScreenImageViewerProps {
  artworks: Artwork[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const FullScreenImageViewer = ({ artworks, currentIndex, isOpen, onClose }: FullScreenImageViewerProps) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const { toast } = useToast();

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : artworks.length - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < artworks.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      const artwork = artworks[activeIndex];
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

  if (!isOpen || !artworks[activeIndex]) return null;

  const currentArtwork = artworks[activeIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-60"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-16 p-2 text-white hover:text-gray-300 transition-colors z-60"
      >
        <Download className="h-8 w-8" />
      </button>

      {/* Previous button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors z-60"
      >
        <ChevronLeft className="h-12 w-12" />
      </button>

      {/* Next button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors z-60"
      >
        <ChevronRight className="h-12 w-12" />
      </button>

      {/* Main image */}
      <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center">
        <img
          src={currentArtwork.primaryImage || currentArtwork.image_url}
          alt={currentArtwork.title}
          className="max-w-full max-h-[80vh] object-contain"
        />
        
        {/* Image info */}
        <div className="mt-4 text-center text-white max-w-2xl">
          <h2 className="text-2xl font-playfair font-semibold mb-2">
            {currentArtwork.title}
          </h2>
          <p className="text-lg text-gray-300 mb-1">{currentArtwork.artist}</p>
          <p className="text-sm text-gray-400">{currentArtwork.year} • {currentArtwork.department}</p>
          <p className="text-xs text-gray-500 mt-2">
            {activeIndex + 1} of {artworks.length}
          </p>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default FullScreenImageViewer;
